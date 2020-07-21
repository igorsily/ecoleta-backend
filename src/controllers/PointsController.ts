import knex from "../database/connection";
import { Request, Response } from "express";

class PointsController {
  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    const trx = await knex.transaction();

    const point = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    };

    const insertedId = await trx("points").insert(point).returning("id");

    const point_id = insertedId[0];

    const pointItems = items
      .split(",")
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
        return {
          item_id,
          point_id,
        };
      });

    await trx("point_items").insert(pointItems);

    await trx.commit();

    return response.json({
      id: point_id,
      ...point,
    });
  }
  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex("points").where("id", id).first();

    if (!point) {
      return response.status(400).json({ message: "Point not found." });
    }

    const items = await knex("items")
      .join("point_items", "items.id", "=", "point_items.item_id")
      .where("point_items.point_id", id)
      .select("items.title");

    const serializedPoints = {
      ...point,
      image_url: `http://192.168.0.7:3333/uploads/${point.image}`,
    };

    return response.json({ point: serializedPoints, items });
  }

  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query;
    let parsedItems;
    if (typeof items !== "undefined") {
      parsedItems = String(items)
        .split(",")
        .map((item) => Number(item.trim()));
    } else {
      parsedItems = [1, 2, 3, 4, 5, 6];
    }

    const points = await knex("points")
      .join("point_items", "points.id", "=", "point_items.point_id")
      .whereIn("point_items.item_id", parsedItems)
      .where("city", String(city))
      .where("uf", String(uf))
      .distinct()
      .select("points.*");

    const serializedPoints = points.map((point) => {
      return {
        ...point,
        image_url: `http://192.168.0.7:3333/uploads/${point.image}`,
      };
    });

    return response.json(serializedPoints);
  }
}

export default PointsController;
