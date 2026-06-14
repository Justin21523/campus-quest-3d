// Shop definitions: each shop is a vendor located in a specific zone that sells
// a curated set of items for Campus Coins. Shops are interactable world objects
// (ShopKeeper component) — walk up and press E to open the ShopPanel.

export interface ShopItem {
  itemId: string;
  price: number;
  /** -1 means unlimited stock; otherwise the shop restocks on day change. */
  stock: number;
}

export interface ShopDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  zone: string;
  position: [number, number, number];
  items: ShopItem[];
}

export const SHOP_DEFINITIONS: Record<string, ShopDefinition> = {
  cafeteria: {
    id: 'cafeteria',
    name: 'Campus Cafeteria',
    description: 'The main school cafeteria. Hot meals and snacks available daily.',
    icon: '🍽️',
    zone: 'main_building_1f',
    position: [6, 0, -4],
    items: [
      { itemId: 'bento_box', price: 30, stock: 5 },
      { itemId: 'rice_ball', price: 10, stock: 10 },
      { itemId: 'melon_bread', price: 8, stock: 10 },
      { itemId: 'energy_drink', price: 15, stock: 8 },
      { itemId: 'coffee_can', price: 12, stock: 8 },
      { itemId: 'sports_drink', price: 20, stock: 5 },
    ],
  },

  stationery_shop: {
    id: 'stationery_shop',
    name: 'Starbridge Stationery',
    description: 'A cozy shop selling school supplies, pens, and notebooks.',
    icon: '✏️',
    zone: 'campus_outdoor',
    position: [12, 0, 8],
    items: [
      { itemId: 'fancy_pen', price: 20, stock: 10 },
      { itemId: 'notebook', price: 15, stock: 10 },
      { itemId: 'map_fragment', price: 50, stock: 3 },
    ],
  },

  gift_shop: {
    id: 'gift_shop',
    name: 'Campus Gift Shop',
    description: 'Pick up something nice for a friend — or yourself.',
    icon: '🎁',
    zone: 'campus_outdoor',
    position: [-10, 0, 14],
    items: [
      { itemId: 'flower_bouquet', price: 25, stock: 5 },
      { itemId: 'choco_box', price: 20, stock: 5 },
      { itemId: 'hair_ribbon', price: 30, stock: 5 },
      { itemId: 'keychain', price: 35, stock: 5 },
      { itemId: 'sunglasses', price: 60, stock: 2 },
    ],
  },

  riverside_kiosk: {
    id: 'riverside_kiosk',
    name: 'Riverside Kiosk',
    description: 'A small snack stand near the Riverside school gate.',
    icon: '🏪',
    zone: 'riverside_outdoor',
    position: [-4, 0, 10],
    items: [
      { itemId: 'rice_ball', price: 8, stock: 10 },
      { itemId: 'coffee_can', price: 10, stock: 8 },
      { itemId: 'melon_bread', price: 6, stock: 10 },
      { itemId: 'sports_drink', price: 18, stock: 5 },
    ],
  },

  northhill_store: {
    id: 'northhill_store',
    name: 'Northhill Campus Store',
    description: 'Northhill\'s well-stocked school store. Premium items available.',
    icon: '🏬',
    zone: 'northhill_outdoor',
    position: [4, 0, 10],
    items: [
      { itemId: 'bento_box', price: 28, stock: 5 },
      { itemId: 'energy_drink', price: 12, stock: 8 },
      { itemId: 'fancy_pen', price: 18, stock: 10 },
      { itemId: 'notebook', price: 12, stock: 10 },
      { itemId: 'keychain', price: 30, stock: 5 },
    ],
  },
};

export function getShopById(id: string): ShopDefinition | undefined {
  return SHOP_DEFINITIONS[id];
}

export function getShopsByZone(zone: string): ShopDefinition[] {
  return Object.values(SHOP_DEFINITIONS).filter((s) => s.zone === zone);
}
