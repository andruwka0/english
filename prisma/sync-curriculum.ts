import "dotenv/config";
import { readFile } from "node:fs/promises";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type CodeTask = { title: string; prompt: string; starterCode: string; testCode: string };
type LessonDefinition = { slug: string; title: string; order: number; file: string; tasks?: CodeTask[]; replaceTasks?: boolean };
const task = (title: string, prompt: string, starterCode: string, testCode: string): CodeTask => ({ title, prompt, starterCode, testCode });

const lessons: LessonDefinition[] = [
  {
    slug: "urok-3-if-elif-else", title: "Урок 3. Условия: if и else", order: 3, file: "lesson-03-if-else.md", replaceTasks: true,
    tasks: [
      task("1. После покупки", "В переменных money и price лежат числа. Создай balance: сначала прибавь к money 5, затем вычти price. Выведи balance.", "money = 12\nprice = 8\n\n# Создай balance\n", "assert balance == money + 5 - price\nassert output.strip() == str(balance)"),
      task("2. Наклейки", "В переменных packs и stickers лежат числа. В каждой пачке stickers наклеек, а еще есть одна дополнительная. Создай total и выведи его.", "packs = 3\nstickers = 4\n\n# Умножь и прибавь одну наклейку\n", "assert total == packs * stickers + 1\nassert output.strip() == str(total)"),
      task("3. Пицца", "В переменных pizzas, pieces и friends лежат числа. Сначала найди все кусочки пиццы, затем раздели их поровну между friends. Создай part и выведи его.", "pizzas = 2\npieces = 8\nfriends = 4\n\n# Используй * и /\n", "assert part == pizzas * pieces / friends\nassert output.strip() == str(part)"),
      task("4. Кто выше", "В переменных first_height и second_height лежат числа. Выведи Первый выше, если first_height больше second_height, иначе выведи Второй выше.", "first_height = 140\nsecond_height = 138\n\n# Используй >, if и else\n", "expected = 'Первый выше' if first_height > second_height else 'Второй выше'\nassert output.strip() == expected"),
      task("5. Проверка имени", "В переменной name лежит имя. Если оно равно Маша, выведи Привет, Маша!, иначе выведи Привет!.", "name = 'Маша'\n\n# Сравни name через ==\n", "expected = 'Привет, Маша!' if name == 'Маша' else 'Привет!'\nassert output.strip() == expected"),
      task("6. Любимая игра", "В переменной game лежит название игры. Если это Minecraft, выведи Отличный выбор!, иначе выведи Тоже здорово!.", "game = 'Minecraft'\n\n# Используй ==, if и else\n", "expected = 'Отличный выбор!' if game == 'Minecraft' else 'Тоже здорово!'\nassert output.strip() == expected"),
      task("7. Билет в парк", "В money лежат деньги, а в ticket_price - цена одного билета. Посчитай cost двух билетов. Если money больше cost, выведи Можно идти в парк!, иначе выведи Нужно еще накопить.", "money = 15\nticket_price = 6\n\n# Создай cost, затем напиши условие\n", "assert cost == ticket_price * 2\nexpected = 'Можно идти в парк!' if money > cost else 'Нужно еще накопить'\nassert output.strip() == expected"),
    ],
  },
  {
    slug: "urok-4-elif", title: "Урок 4. Несколько условий: elif", order: 4, file: "lesson-04-elif.md",
    tasks: [
      task("1. Температура", "В temp лежит температура. Выведи Холодно, если temp меньше 0; Тепло, если temp от 0 до 20 включительно; Жарко во всех остальных случаях.", "temp = 15\n\n# Используй if, elif и else\n", "expected = 'Холодно' if temp < 0 else ('Тепло' if temp <= 20 else 'Жарко')\nassert output.strip() == expected"),
      task("2. Билет в кино", "В age лежит возраст. Если age меньше 6, выведи Бесплатно. Если age меньше или равно 12, выведи Детский билет. Иначе выведи Обычный билет.", "age = 10\n\n# Напиши три варианта\n", "expected = 'Бесплатно' if age < 6 else ('Детский билет' if age <= 12 else 'Обычный билет')\nassert output.strip() == expected"),
      task("3. Уровень игры", "В stars лежит число звезд. Выведи Новичок для 0-2, Игрок для 3-5 и Мастер для 6 и больше.", "stars = 4\n\n# Используй >= и elif\n", "expected = 'Мастер' if stars >= 6 else ('Игрок' if stars >= 3 else 'Новичок')\nassert output.strip() == expected"),
      task("4. Оценка", "В score лежит число от 0 до 10. Выведи Отлично для 9 и больше, Хорошо для 6 и больше, Попробуй еще для остальных случаев.", "score = 7\n\n# Напиши условия\n", "expected = 'Отлично' if score >= 9 else ('Хорошо' if score >= 6 else 'Попробуй еще')\nassert output.strip() == expected"),
      task("5. Коробка", "В weight лежит вес посылки. Выведи Легкая, если вес меньше 2; Обычная, если вес меньше или равен 5; Тяжелая в остальных случаях.", "weight = 5\n\n# Используй < и <=\n", "expected = 'Легкая' if weight < 2 else ('Обычная' if weight <= 5 else 'Тяжелая')\nassert output.strip() == expected"),
    ],
  },
  { slug: "urok-4-for-range", title: "Урок 5. Цикл for и range()", order: 5, file: "lesson-05-for.md" },
  { slug: "urok-5-while", title: "Урок 6. Цикл while", order: 6, file: "lesson-06-while.md" },
  {
    slug: "urok-7-lists", title: "Урок 7. Списки", order: 7, file: "lesson-07-lists.md",
    tasks: [
      task("1. Любимые цвета", "Создай список colors из трех цветов и выведи весь список.", "# Создай colors\n", "assert len(colors) == 3\nassert output.strip() == str(colors)"),
      task("2. Первый герой", "В списке heroes лежат герои. Выведи первого героя.", "heroes = ['Луна', 'Робин', 'Кит']\n\n# Выведи первый элемент\n", "assert output.strip() == heroes[0]"),
      task("3. Сколько книг", "В списке books лежат названия книг. Выведи количество книг с помощью len().", "books = ['Алиса', 'Хоббит', 'Остров']\n\n# Выведи длину списка\n", "assert output.strip() == str(len(books))"),
      task("4. Новое дело", "Создай список plans из двух дел. Добавь в него еще одно дело через append() и выведи список.", "plans = ['рисовать', 'читать']\n\n# Добавь еще одно дело\n", "assert len(plans) == 3\nassert output.strip() == str(plans)"),
      task("5. Прогулка по списку", "В списке pets лежат животные. Выведи каждое животное с новой строки с помощью for.", "pets = ['кот', 'пес', 'хомяк']\n\n# Используй for\n", "assert output.strip().splitlines() == pets"),
    ],
  },
  { slug: "urok-6-import-random", title: "Урок 8. Библиотеки и random", order: 8, file: "lesson-08-libraries.md" },
  { slug: "urok-7-industrial-development", title: "Урок 9. Знакомство с промышленной разработкой", order: 9, file: "lesson-09-industrial-development.md" },
];

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const readLessonContent = (file: string) => readFile(new URL(`../content/python/${file}`, import.meta.url), "utf8");

async function syncTasks(lessonId: string, definitions: CodeTask[], replace: boolean) {
  const homework = await prisma.homework.upsert({ where: { lessonId }, update: {}, create: { lessonId }, include: { tasks: { include: { submissions: true } } } });
  if (homework.tasks.length > 0 && !replace) return;
  await prisma.$transaction(async (tx) => {
    await tx.task.deleteMany({ where: { homeworkId: homework.id } });
    await tx.task.createMany({ data: definitions.map((item, order) => ({ homeworkId: homework.id, kind: "CODE", title: item.title, prompt: item.prompt, data: { kind: "CODE", starterCode: item.starterCode, testCode: item.testCode } as Prisma.InputJsonValue, order })) });
  });
}

async function main() {
  const course = await prisma.course.upsert({ where: { slug: "python" }, update: {}, create: { slug: "python", title: "Python", icon: "🐍" } });
  for (const definition of lessons) {
    const content = await readLessonContent(definition.file);
    const lesson = await prisma.lesson.upsert({ where: { courseId_slug: { courseId: course.id, slug: definition.slug } }, update: { title: definition.title, content, order: definition.order }, create: { courseId: course.id, slug: definition.slug, title: definition.title, content, order: definition.order } });
    if (definition.tasks) await syncTasks(lesson.id, definition.tasks, definition.replaceTasks ?? false);
  }
}

main().then(() => console.log("Учебная программа синхронизирована.")).catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
