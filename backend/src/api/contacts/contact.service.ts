import prisma from "../../utils/db";
import { NotFoundError } from "../../utils/errors";
import { sendContactReplyEmail } from "../../utils/email";
export class ContactService {
  async create(data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) {
    return prisma.contact.create({ data });
  }

  async getAll(filters?: { isRead?: boolean; isReplied?: boolean }) {
    return prisma.contact.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id: string) {
    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundError("Contact not found");
    }

    // Mark as read
    if (!contact.isRead) {
      await prisma.contact.update({
        where: { id },
        data: { isRead: true },
      });
    }

    return contact;
  }

  async reply(id: string, reply: string) {
    const contact = await prisma.contact.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new NotFoundError("Contact not found");
    }

    const updated = await prisma.contact.update({
      where: { id },
      data: {
        reply,
        isReplied: true,
        repliedAt: new Date(),
      },
    });

    // Gửi email phản hồi tới user
    try {
      await sendContactReplyEmail(
        contact.email,
        contact.name,
        contact.subject,
        reply
      );
    } catch (error) {
      throw new Error("Failed to send email");
    }

    return updated;
  }

  async delete(id: string) {
    await prisma.contact.delete({ where: { id } });
  }
}
