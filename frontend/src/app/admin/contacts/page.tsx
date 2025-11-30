"use client";

import { useEffect, useState } from "react";
import { contactsAPI } from "@/services/api";
import { Contact } from "@/types";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  Trash2,
  Reply,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "unreplied">("all");

  const loadContacts = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter === "unread") params.isRead = false;
      if (filter === "unreplied") params.isReplied = false;

      const res = await contactsAPI.getAll(params);
      setContacts(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách liên hệ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, [filter]);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("vi-VN");

  const handleSelectContact = async (contact: Contact) => {
    try {
      const res = await contactsAPI.getById(contact.id);
      const fullContact = res.data.data;
      setSelectedContact(fullContact);
      setReplyText(fullContact.reply || "");
      // BE getById đã mark isRead = true
      loadContacts();
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải chi tiết liên hệ");
    }
  };

  const handleReply = async () => {
    if (!selectedContact) return;
    if (!replyText.trim()) {
      toast.error("Vui lòng nhập nội dung trả lời");
      return;
    }

    setReplyLoading(true);
    try {
      const res = await contactsAPI.reply(
        selectedContact.id,
        replyText.trim()
      );
      const updated = res.data.data;
      toast.success("Đã gửi trả lời cho khách hàng");
      setSelectedContact(updated);
      setContacts((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch (error) {
      console.error(error);
      toast.error("Gửi trả lời thất bại");
    } finally {
      setReplyLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa liên hệ này?")) return;

    try {
      await contactsAPI.delete(id);
      toast.success("Đã xóa liên hệ");
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (selectedContact?.id === id) {
        setSelectedContact(null);
        setReplyText("");
      }
    } catch (error) {
      console.error(error);
      toast.error("Xóa liên hệ thất bại");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Liên hệ khách hàng</h2>
        <p className="text-gray-600">
          Xem và xử lý các yêu cầu hỗ trợ / liên hệ từ khách.
        </p>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm border ${
            filter === "all"
              ? "bg-primary-600 text-white border-primary-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg text-sm border ${
            filter === "unread"
              ? "bg-primary-600 text-white border-primary-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          Chưa đọc
        </button>
        <button
          onClick={() => setFilter("unreplied")}
          className={`px-4 py-2 rounded-lg text-sm border ${
            filter === "unreplied"
              ? "bg-primary-600 text-white border-primary-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
          }`}
        >
          Chưa trả lời
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List contacts */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : contacts.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Chưa có liên hệ nào
            </p>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  className={`w-full text-left p-3 rounded-lg border transition flex flex-col gap-1 ${
                    selectedContact?.id === contact.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold line-clamp-1">
                      {contact.subject}
                    </span>
                    {!contact.isRead && (
                      <span className="ml-2 inline-block px-2 py-0.5 text-[10px] rounded-full bg-red-100 text-red-700">
                        Mới
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-xs text-gray-600 gap-2">
                    <Mail className="w-3 h-3" />
                    <span className="line-clamp-1">{contact.email}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatDate(contact.createdAt)}</span>
                    <span>
                      {contact.isReplied ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đã trả lời
                        </span>
                      ) : (
                        <span className="text-yellow-600">Chưa trả lời</span>
                      )}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail + reply */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          {selectedContact ? (
            <>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    {selectedContact.subject}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedContact.name} - {selectedContact.email}
                  </p>
                  {selectedContact.phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Phone className="w-4 h-4" /> {selectedContact.phone}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Gửi lúc: {formatDate(selectedContact.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(selectedContact.id)}
                  className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-1">
                  Nội dung khách hàng
                </h4>
                <div className="p-3 rounded-lg bg-gray-50 text-sm text-gray-800 whitespace-pre-line">
                  {selectedContact.message}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                  <Reply className="w-4 h-4" /> Trả lời khách hàng
                </h4>
                <textarea
                  className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={5}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nội dung trả lời (ghi chú email/đã gọi điện, v.v.)"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    {selectedContact.isReplied &&
                      selectedContact.repliedAt &&
                      `Đã trả lời lúc: ${formatDate(
                        selectedContact.repliedAt
                      )}`}
                  </p>
                  <button
                    onClick={handleReply}
                    disabled={replyLoading}
                    className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 disabled:opacity-60 flex items-center gap-2"
                  >
                    {replyLoading && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {selectedContact.isReplied
                      ? "Cập nhật trả lời"
                      : "Gửi trả lời"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              Chọn một liên hệ ở bên trái để xem chi tiết và trả lời.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
