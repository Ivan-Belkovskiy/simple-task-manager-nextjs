import { Category } from "@/app/(protected)/page";

export type CategoryOutput = Category & { children: CategoryOutput[] };

export const generateCategoryTree = (categories: Category[]) => {
    const map = new Map<number, CategoryOutput>();
    const roots: CategoryOutput[] = [];

    categories.forEach((cat) => {
        map.set(cat.id, {
            ...cat,
            children: [],
        });
    });

    categories.forEach((cat) => {
        const node = map.get(cat.id)!;
        if (cat.parent_id === null || cat.parent_id === undefined) {
            roots.push(node);
        } else {
            const parent = map.get(cat.parent_id);
            if (parent) {
                parent.children.push(node);
            }
        }
    });

    return roots;
};

export const formatCategoryOptions = (categories: Category[]) => {
    const tree = generateCategoryTree(categories);

    const recursiveFormat = (tree: CategoryOutput[], level: number = 0): any[] => {
        if (level > 30) return [];

        return tree.map(c => ({
            label: c.name,
            value: c.id,

            innerOptions: recursiveFormat(c.children, (level + 1)),
        }))
    }

    return recursiveFormat(tree, 0);

};