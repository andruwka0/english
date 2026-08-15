import "dotenv/config";
import { readFile } from "node:fs/promises";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type CodeTask = {
  title: string;
  prompt: string;
  starterCode: string;
  testCode: string;
};

type LessonDefinition = {
  slug: string;
  title: string;
  order: number;
  file: string;
  tasks?: CodeTask[];
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const lessons: LessonDefinition[] = [
  {
    slug: "urok-3-if-elif-else",
    title: "Урок 3. Условия: if, elif, else",
    order: 3,
    file: "lesson-03-if-else.md",
    tasks: [
      {
        title: "1. Чётное или нечётное",
        prompt: "В переменной number лежит число. Выведи Чётное, если оно делится на 2 без остатка, иначе выведи Нечётное.",
        starterCode: "number = 7\n\n# Напиши условие\n",
        testCode: "assert output.strip() in ['Чётное', 'Нечётное'], 'Выведи один из двух вариантов'\nassert output.strip() == ('Чётное' if number % 2 == 0 else 'Нечётное'), 'Проверь остаток от деления на 2'",
      },
      {
        title: "2. Можно ли кататься",
        prompt: "В переменной height хранится рост в сантиметрах. Если рост не меньше 120, выведи Можно кататься, иначе - Пока нельзя.",
        starterCode: "height = 118\n\n# Напиши if и else\n",
        testCode: "expected = 'Можно кататься' if height >= 120 else 'Пока нельзя'\nassert output.strip() == expected, 'Проверь условие height >= 120'",
      },
      {
        title: "3. Оценка",
        prompt: "В score хранится число от 0 до 10. Выведи Отлично для 9-10, Хорошо для 6-8 и Нужно потренироваться для остальных значений.",
        starterCode: "score = 8\n\n# Используй if, elif и else\n",
        testCode: "expected = 'Отлично' if score >= 9 else ('Хорошо' if score >= 6 else 'Нужно потренироваться')\nassert output.strip() == expected, 'Проверь все три варианта'",
      },
      {
        title: "4. Пароль",
        prompt: "В переменной password лежит введённый пароль. Если он равен котёнок, выведи Добро пожаловать, иначе - Неверный пароль.",
        starterCode: "password = 'котёнок'\n\n# Сравни пароль\n",
        testCode: "expected = 'Добро пожаловать' if password == 'котёнок' else 'Неверный пароль'\nassert output.strip() == expected, 'Сравни пароль через =='",
      },
      {
        title: "5. Подходящая погода",
        prompt: "В переменных is_sunny и is_warm лежат True или False. Выведи Гуляем, только если оба значения True. Во всех других случаях выведи Остаёмся дома.",
        starterCode: "is_sunny = True\nis_warm = False\n\n# Используй and\n",
        testCode: "expected = 'Гуляем' if is_sunny and is_warm else 'Остаёмся дома'\nassert output.strip() == expected, 'Проверь оба условия через and'",
      },
    ],
  },
  {
    slug: "urok-4-for-range",
    title: "Урок 4. Цикл for и range()",
    order: 4,
    file: "lesson-04-for.md",
    tasks: [
      { title: "1. Счёт от 1 до 5", prompt: "С помощью for и range() выведи числа от 1 до 5, каждое с новой строки.", starterCode: "# Напиши цикл\n", testCode: "assert output.strip().splitlines() == ['1', '2', '3', '4', '5'], 'Используй range(1, 6)'" },
      { title: "2. Чётные числа", prompt: "Выведи все чётные числа от 2 до 10 с помощью range() и шага.", starterCode: "# Напиши цикл с шагом\n", testCode: "assert output.strip().splitlines() == ['2', '4', '6', '8', '10'], 'Используй шаг 2'" },
      { title: "3. Сумма", prompt: "Создай total и посчитай в нём сумму чисел от 1 до 10. Выведи total.", starterCode: "total = 0\n\n# Используй for\n", testCode: "assert total == 55, 'Сумма чисел от 1 до 10 равна 55'\nassert output.strip() == '55', 'Выведи total'" },
      { title: "4. Буквы слова", prompt: "В переменной word лежит слово. Выведи каждую его букву с новой строки.", starterCode: "word = 'Python'\n\n# Пройдись по строке\n", testCode: "assert output.strip().splitlines() == list(word), 'Выведи все буквы слова по порядку'" },
      { title: "5. Только чётные", prompt: "Выведи чётные числа от 1 до 10. Используй for, if и остаток от деления.", starterCode: "# Напиши цикл и условие\n", testCode: "assert output.strip().splitlines() == ['2', '4', '6', '8', '10'], 'Проверь каждое число через % 2'" },
    ],
  },
  {
    slug: "urok-5-while",
    title: "Урок 5. Цикл while",
    order: 5,
    file: "lesson-05-while.md",
    tasks: [
      { title: "1. Счётчик", prompt: "С помощью while выведи числа от 1 до 5.", starterCode: "count = 1\n\n# Напиши цикл while\n", testCode: "assert output.strip().splitlines() == ['1', '2', '3', '4', '5'], 'Не забудь увеличивать count'" },
      { title: "2. Обратный отсчёт", prompt: "С помощью while выведи числа от 5 до 1, а затем напечатай Старт!.", starterCode: "count = 5\n\n# Напиши обратный отсчёт\n", testCode: "assert output.strip().splitlines() == ['5', '4', '3', '2', '1', 'Старт!'], 'Уменьшай count на каждом шаге'" },
      { title: "3. Сумма до n", prompt: "В переменной n лежит число. С помощью while посчитай сумму чисел от 1 до n в total и выведи total.", starterCode: "n = 5\nnumber = 1\ntotal = 0\n\n# Напиши цикл\n", testCode: "assert total == sum(range(1, n + 1)), 'Сложи все числа от 1 до n'\nassert output.strip() == str(total), 'Выведи total'" },
      { title: "4. Энергия", prompt: "В energy лежит количество энергии. Пока energy больше 0, печатай Играем! и уменьшай energy на 1. Затем выведи Пора отдыхать.", starterCode: "energy = 3\n\n# Напиши цикл\n", testCode: "assert energy == 0, 'Цикл должен закончиться при energy = 0'\nassert output.strip().splitlines() == ['Играем!', 'Играем!', 'Играем!', 'Пора отдыхать'], 'Проверь порядок сообщений'" },
      { title: "5. Удвоение", prompt: "В value лежит число. Удваивай его с помощью while, пока оно меньше 100. Выведи итоговое value.", starterCode: "value = 7\n\n# Напиши цикл\n", testCode: "assert value >= 100, 'Продолжай, пока value меньше 100'\nassert value == 112, 'Для начального значения 7 итог должен быть 112'\nassert output.strip() == str(value), 'Выведи итог'" },
    ],
  },
  {
    slug: "urok-6-import-random",
    title: "Урок 6. Библиотеки и random",
    order: 6,
    file: "lesson-06-random.md",
    tasks: [
      { title: "1. Бросок кубика", prompt: "Подключи random. Создай dice с помощью random.randint(1, 6) и выведи его.", starterCode: "# Подключи random и брось кубик\n", testCode: "assert 1 <= dice <= 6, 'dice должен быть числом от 1 до 6'\nassert output.strip() == str(dice), 'Выведи dice'" },
      { title: "2. Случайное настроение", prompt: "Подключи random. Создай список moods из трёх настроений, выбери одно в mood через random.choice() и выведи его.", starterCode: "# Создай moods и выбери mood\n", testCode: "assert len(moods) >= 3, 'В списке должно быть хотя бы три настроения'\nassert mood in moods, 'Выбери mood из moods'\nassert output.strip() == mood, 'Выведи выбранное настроение'" },
      { title: "3. Случайный герой", prompt: "Создай список heroes минимум из трёх героев. Выбери случайного hero и выведи фразу Сегодня играет: <герой>.", starterCode: "# Подключи random и выбери героя\n", testCode: "assert len(heroes) >= 3, 'Добавь минимум трёх героев'\nassert hero in heroes, 'Выбери hero из heroes'\nassert hero in output and 'Сегодня играет:' in output, 'Выведи фразу с героем'" },
      { title: "4. Секретное число", prompt: "Создай secret_number - случайное число от 1 до 10. Выведи подсказку: Я загадал число от 1 до 10.", starterCode: "# Используй random.randint\n", testCode: "assert 1 <= secret_number <= 10, 'Число должно быть от 1 до 10'\nassert '1' in output and '10' in output, 'Выведи подсказку о диапазоне'" },
      { title: "5. Карточки", prompt: "Создай список cards минимум из четырёх карточек, перемешай его random.shuffle(cards) и выведи список.", starterCode: "# Подключи random, создай и перемешай cards\n", testCode: "assert len(cards) >= 4, 'Добавь минимум четыре карточки'\nassert output.strip() == str(cards), 'Выведи перемешанный список cards'" },
    ],
  },
  { slug: "urok-7-industrial-development", title: "Урок 7. Знакомство с промышленной разработкой", order: 7, file: "lesson-07-industrial-development.md" },
];

async function readLessonContent(file: string) {
  return readFile(new URL(`../content/python/${file}`, import.meta.url), "utf8");
}

async function main() {
  const course = await prisma.course.upsert({
    where: { slug: "python" },
    update: {},
    create: { slug: "python", title: "Python", icon: "🐍" },
  });

  for (const definition of lessons) {
    const content = await readLessonContent(definition.file);
    const lesson = await prisma.lesson.upsert({
      where: { courseId_slug: { courseId: course.id, slug: definition.slug } },
      update: { title: definition.title, content, order: definition.order },
      create: { courseId: course.id, slug: definition.slug, title: definition.title, content, order: definition.order },
    });

    if (!definition.tasks) continue;
    const homework = await prisma.homework.upsert({
      where: { lessonId: lesson.id },
      update: {},
      create: { lessonId: lesson.id },
      include: { tasks: true },
    });
    if (homework.tasks.length > 0) {
      console.log(`Домашка урока ${definition.order} уже существует - пропускаю.`);
      continue;
    }

    await prisma.task.createMany({
      data: definition.tasks.map((task, index) => ({
        homeworkId: homework.id,
        kind: "CODE",
        title: task.title,
        prompt: task.prompt,
        data: { kind: "CODE", starterCode: task.starterCode, testCode: task.testCode } as Prisma.InputJsonValue,
        order: index,
      })),
    });
  }
}

main()
  .then(() => console.log("Учебная программа синхронизирована."))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
