"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession, requireTeacher } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const redirectWithNotice = (message: string) => redirect(`/rewards?notice=${encodeURIComponent(message)}`);

export async function createRewardItem(formData: FormData) {
  await requireTeacher();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  if (!title || !Number.isInteger(price) || price < 1 || !Number.isInteger(stock) || stock < 1) redirectWithNotice("Укажи название, цену и количество от 1.");
  await prisma.rewardItem.create({ data: { title, description: description || null, price, stock } });
  revalidatePath("/rewards");
  revalidatePath("/profile");
  redirectWithNotice("Предмет добавлен в магазин.");
}

export async function deleteRewardItem(rewardItemId: string) {
  await requireTeacher();
  await prisma.rewardItem.update({ where: { id: rewardItemId }, data: { isActive: false } });
  revalidatePath("/rewards");
  revalidatePath("/profile");
  redirectWithNotice("Предмет удален из магазина. История покупок сохранена.");
}

export async function purchaseRewardItem(rewardItemId: string) {
  const session = await getSession();
  if (session.role !== "student") redirectWithNotice("Покупки доступны только ученице.");
  try {
    const message = await prisma.$transaction(async (tx) => {
      const [passedTasks, spent, item] = await Promise.all([
        tx.submission.findMany({ where: { passed: true }, distinct: ["taskId"], select: { taskId: true } }),
        tx.rewardPurchase.aggregate({ _sum: { pricePaid: true } }),
        tx.rewardItem.findUnique({ where: { id: rewardItemId }, select: { id: true, price: true, stock: true, isActive: true } }),
      ]);
      if (!item) return "Предмет больше недоступен.";
      if (!item.isActive) return "Этот предмет больше недоступен.";
      if (item.stock < 1) return "Этот предмет уже закончился.";
      if (passedTasks.length - (spent._sum.pricePaid ?? 0) < item.price) return "Пока не хватает звезд.";
      const updated = await tx.rewardItem.updateMany({ where: { id: item.id, stock: { gt: 0 } }, data: { stock: { decrement: 1 } } });
      if (updated.count !== 1) return "Этот предмет только что закончился.";
      await tx.rewardPurchase.create({ data: { rewardItemId: item.id, pricePaid: item.price } });
      return "Покупка сохранена. Покажи учителю, что выбрала.";
    }, { isolationLevel: "Serializable" });
    revalidatePath("/rewards");
    revalidatePath("/profile");
    redirectWithNotice(message);
  } catch {
    redirectWithNotice("Не удалось завершить покупку. Попробуй еще раз.");
  }
}
