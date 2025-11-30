import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { User, CartItem, Product } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      setAuth: (user, token) => {
        set({ user, token });
      },

      setToken: (token) => {
        set({ token });
      },

      logout: () => {
        set({ user: null, token: null });
        // Không cần đụng localStorage nữa,
        // persist sẽ cập nhật lại sessionStorage cho key "auth-storage"
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("auth-storage");
          sessionStorage.removeItem("cart-storage");
        }
      },
    }),
    {
      name: "auth-storage",
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => sessionStorage)
          : undefined,
    }
  )
);

interface CartState {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleSelect: (productId: string) => void;
  toggleSelectAll: () => void;
  removeSelectedItems: () => void;
  clearCart: () => void;
  getTotal: () => number; // tổng tất cả
  getSelectedTotal: () => number; // tổng item được chọn
  getItemCount: () => number;
  getSelectedItems: () => CartItem[];
  setItemsFromServer: (serverItems: any[]) => void;
  voucherCode: string | null;
  voucherDiscount: number;
  setVoucher: (code: string, discount: number) => void;
  clearVoucher: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      voucherCode: null,
      voucherDiscount: 0,
      addToCart: (product, quantity) => {
        const items = get().items;
        const existingItem = items.find(
          (item) => item.product.id === product.id
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          const newItem: CartItem = {
            id: product.id,
            product,
            quantity,
            price: product.salePrice || product.price,
            selected: true,
          };
          set({ items: [...items, newItem] });
        }
      },
      removeFromCart: (productId) => {
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
      },
      toggleSelect: (productId) => {
        set({
          items: get().items.map((item) =>
            item.product.id === productId
              ? { ...item, selected: item.selected === false }
              : item
          ),
        });
      },

      toggleSelectAll: () => {
        const items = get().items;
        const allSelected = items.every((item) => item.selected !== false);

        set({
          items: items.map((item) => ({ ...item, selected: !allSelected })),
        });
      },

      clearCart: () => set({ items: [] }),
      setItemsFromServer: (serverItems) => {
        const current = get().items;

        const mapped: CartItem[] = serverItems.map((ci: any) => {
          // Giữ lại trạng thái selected cũ
          const old = current.find((i) => i.product.id === ci.product.id);

          return {
            id: ci.id, // LUÔN DÙNG cartItem.id từ server
            product: ci.product,
            quantity: ci.quantity,
            price: ci.product.salePrice || ci.product.price,
            selected: old?.selected ?? true,
          };
        });

        set({ items: mapped });
      },

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
      getSelectedTotal: () => {
        return get()
          .items.filter((item) => item.selected !== false)
          .reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      getSelectedItems: () => {
        return get().items.filter((item) => item.selected !== false);
      },
      removeSelectedItems: () => {
        set({
          items: get().items.filter((item) => !item.selected),
        });
      },
      setVoucher: (code, discount) =>
        set({
          voucherCode: code,
          voucherDiscount: discount,
        }),

      clearVoucher: () =>
        set({
          voucherCode: null,
          voucherDiscount: 0,
        }),
    }),
    {
      name: "cart-storage",
      storage:
        typeof window !== "undefined"
          ? createJSONStorage(() => sessionStorage)
          : undefined,
    }
  )
);
