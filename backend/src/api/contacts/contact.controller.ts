import { Request, Response } from "express";
import { ContactService } from "./contact.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated, sendNoContent } from "../../utils/response";

const contactService = new ContactService();

export const create = asyncHandler(async (req: Request, res: Response) => {
  const contact = await contactService.create(req.body);
  sendCreated(res, contact, "Your message has been sent successfully");
});

export const getAll = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    isRead:
      req.query.isRead === "true"
        ? true
        : req.query.isRead === "false"
          ? false
          : undefined,
    isReplied:
      req.query.isReplied === "true"
        ? true
        : req.query.isReplied === "false"
          ? false
          : undefined,
  };

  const contacts = await contactService.getAll(filters);
  sendSuccess(res, contacts);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const contact = await contactService.getById(req.params.id);
  sendSuccess(res, contact);
});

export const reply = asyncHandler(async (req: Request, res: Response) => {
  const { reply } = req.body;
  const contact = await contactService.reply(req.params.id, reply);
  sendSuccess(res, contact, "Reply sent successfully");
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await contactService.delete(req.params.id);
  sendNoContent(res);
});
