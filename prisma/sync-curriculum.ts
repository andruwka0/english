import "dotenv/config";
import { readFile } from "node:fs/promises";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type CodeTask = { title: string; prompt: string; starterCode: string; testCode: string };
type LessonDefinition = {
  slug: string;
  title: string;
  order: number;
  file: string;
  tasks?: CodeTask[];
  replaceTasks?: boolean;
  refreshTasks?: boolean;
};
type ProjectDefinition = {
  slug: string;
  title: string;
  topic: string;
  specification: string;
  starterCode: string;
  testCode: string;
  order: number;
};
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
  {
    slug: "urok-4-for-range", title: "Урок 5. Цикл for и range()", order: 5, file: "lesson-05-for.md", refreshTasks: true,
    tasks: [
      task("1. Считаем до пяти", "Напечатай числа от 1 до 5: каждое с новой строки. Используй for и range().", "# Напиши цикл for\n", "assert output.strip().splitlines() == ['1', '2', '3', '4', '5']"),
      task("2. Четные числа", "Напечатай четные числа от 2 до 10: каждое с новой строки. Используй третий аргумент range() - шаг.", "# Используй range(2, 11, 2)\n", "assert output.strip().splitlines() == ['2', '4', '6', '8', '10']"),
      task("3. Сумма чисел", "В n лежит число. С помощью for найди сумму всех чисел от 1 до n. Сохрани ее в total и выведи total.", "n = 5\n\n# Создай total и цикл for\n", "for number, expected in [(1, 1), (5, 15), (10, 55)]:\n    case_output, values = run_case(n=number)\n    assert values['total'] == expected\n    assert case_output.strip() == str(expected)"),
      task("4. Буквы слова", "В word лежит слово. Напечатай каждую его букву с новой строки с помощью for.", "word = 'Python'\n\n# Пройдись по слову циклом for\n", "for word in ['A', 'кот', 'Python']:\n    case_output, _ = run_case(word=word)\n    assert case_output.strip().splitlines() == list(word)"),
      task("5. Четные до границы", "В limit лежит число. Напечатай все четные числа от 2 до limit включительно. Используй for, range() и шаг 2.", "limit = 10\n\n# Напечатай четные числа до limit\n", "for limit, expected in [(2, ['2']), (7, ['2', '4', '6']), (10, ['2', '4', '6', '8', '10'])]:\n    case_output, _ = run_case(limit=limit)\n    assert case_output.strip().splitlines() == expected"),
    ],
  },
  {
    slug: "urok-5-while", title: "Урок 6. Цикл while", order: 6, file: "lesson-06-while.md", refreshTasks: true,
    tasks: [
      task("1. Считаем до пяти", "Напечатай числа от 1 до 5: каждое с новой строки. Используй while и не забудь менять счетчик.", "count = 1\n\n# Напиши цикл while\n", "assert output.strip().splitlines() == ['1', '2', '3', '4', '5']"),
      task("2. Обратный отсчет", "В count лежит число. Напечатай числа от count до 1: каждое с новой строки. Используй while.", "count = 5\n\n# Сделай обратный отсчет\n", "for count, expected in [(1, ['1']), (3, ['3', '2', '1']), (5, ['5', '4', '3', '2', '1'])]:\n    case_output, _ = run_case(count=count)\n    assert case_output.strip().splitlines() == expected"),
      task("3. Сумма до n", "В n лежит число. С помощью while найди сумму чисел от 1 до n. Сохрани результат в total и выведи его.", "n = 5\n\n# Создай total и счетчик\n", "for number, expected in [(1, 1), (4, 10), (8, 36)]:\n    case_output, values = run_case(n=number)\n    assert values['total'] == expected\n    assert case_output.strip() == str(expected)"),
      task("4. Энергия", "В energy лежит число зарядов. Пока energy больше 0, печатай его значение и уменьшай на 1. Каждое число - с новой строки.", "energy = 3\n\n# Используй while\n", "for energy, expected in [(1, ['1']), (3, ['3', '2', '1']), (5, ['5', '4', '3', '2', '1'])]:\n    case_output, values = run_case(energy=energy)\n    assert case_output.strip().splitlines() == expected\n    assert values['energy'] == 0"),
      task("5. Удваиваем число", "В value лежит число. Удваивай его в цикле while, пока value не станет не меньше 100. Выведи итоговое value.", "value = 7\n\n# Удваивай value в цикле while\n", "for value, expected in [(1, 128), (7, 112), (50, 100)]:\n    case_output, values = run_case(value=value)\n    assert values['value'] == expected\n    assert case_output.strip() == str(expected)"),
    ],
  },
  {
    slug: "urok-7-lists", title: "Урок 7. Списки", order: 7, file: "lesson-07-lists.md", refreshTasks: true,
    tasks: [
      task("1. Любимые цвета", "Создай список colors из трех цветов и выведи весь список.", "# Создай colors\n", "assert len(colors) == 3\nassert output.strip() == str(colors)"),
      task("2. Первый герой", "В списке heroes лежат герои. Выведи первого героя.", "heroes = ['Луна', 'Робин', 'Кит']\n\n# Выведи первый элемент\n", "for heroes in [['Луна'], ['Ася', 'Марк'], ['Кит', 'Робин', 'Луна']]:\n    case_output, _ = run_case(heroes=heroes)\n    assert case_output.strip() == heroes[0]"),
      task("3. Сколько книг", "В списке books лежат названия книг. Выведи количество книг с помощью len().", "books = ['Алиса', 'Хоббит', 'Остров']\n\n# Выведи длину списка\n", "for books in [[], ['Алиса'], ['Алиса', 'Хоббит', 'Остров', 'Муми-тролли']]:\n    case_output, _ = run_case(books=books)\n    assert case_output.strip() == str(len(books))"),
      task("4. Новое дело", "Создай список plans из двух дел. Добавь в него еще одно дело через append() и выведи список.", "plans = ['рисовать', 'читать']\n\n# Добавь еще одно дело\n", "for plans in [['читать', 'рисовать'], ['шахматы', 'спорт'], ['музыка', 'прогулка']]:\n    case_output, values = run_case(plans=plans)\n    assert len(values['plans']) == 3\n    assert case_output.strip() == str(values['plans'])"),
      task("5. Прогулка по списку", "В списке pets лежат животные. Выведи каждое животное с новой строки с помощью for.", "pets = ['кот', 'пес', 'хомяк']\n\n# Используй for\n", "for pets in [['кот'], ['пес', 'хомяк'], ['рыбка', 'попугай', 'черепаха']]:\n    case_output, _ = run_case(pets=pets)\n    assert case_output.strip().splitlines() == pets"),
    ],
  },
  {
    slug: "urok-6-import-random", title: "Урок 8. Библиотеки и random", order: 8, file: "lesson-08-libraries.md", refreshTasks: true,
    tasks: [
      task("1. Кубик", "Подключи random. Создай dice со случайным числом от 1 до 6 и выведи его.", "import random\n\n# Создай dice\n", "for _ in range(3):\n    case_output, values = run_case()\n    assert 1 <= values['dice'] <= 6\n    assert case_output.strip() == str(values['dice'])"),
      task("2. Монетка", "Подключи random. Создай result: случайно выбери строку 'Орел' или 'Решка' и выведи ее.", "import random\n\n# Создай result\n", "for _ in range(3):\n    case_output, values = run_case()\n    assert values['result'] in ['Орел', 'Решка']\n    assert case_output.strip() == values['result']"),
      task("3. Случайный цвет", "В списке colors лежат цвета. Подключи random, выбери случайный цвет в chosen и выведи chosen.", "import random\ncolors = ['синий', 'желтый', 'зеленый']\n\n# Создай chosen через random.choice\n", "for _ in range(3):\n    case_output, values = run_case()\n    assert values['chosen'] in ['синий', 'желтый', 'зеленый']\n    assert case_output.strip() == values['chosen']"),
      task("4. Карточка", "Подключи random. Создай card со случайным числом от 10 до 99 и выведи его.", "import random\n\n# Создай card\n", "for _ in range(3):\n    case_output, values = run_case()\n    assert 10 <= values['card'] <= 99\n    assert case_output.strip() == str(values['card'])"),
      task("5. Случайное настроение", "В moods лежат варианты настроения. Подключи random, выбери случайный вариант в mood и выведи mood.", "import random\nmoods = ['веселое', 'спокойное', 'смелое']\n\n# Создай mood через random.choice\n", "for _ in range(3):\n    case_output, values = run_case()\n    assert values['mood'] in ['веселое', 'спокойное', 'смелое']\n    assert case_output.strip() == values['mood']"),
    ],
  },
  { slug: "urok-7-industrial-development", title: "Урок 9. Знакомство с промышленной разработкой", order: 9, file: "lesson-09-industrial-development.md" },
];

const projects: ProjectDefinition[] = [
  {
    slug: "calculator",
    title: "Калькулятор",
    topic: "Арифметика, input, if и else",
    order: 1,
    specification: `## Техническое задание

Сделай консольный калькулятор.

1. Спроси у пользователя первое число, знак операции и второе число: \`+\`, \`-\`, \`*\` или \`/\`.
2. Для каждого знака посчитай и выведи результат.
3. Если введен незнакомый знак, напечатай: \`Такой операции нет\`.
4. Не дели на ноль: в этом случае напечатай понятное сообщение.

### Что важно

- Используй переменные с понятными названиями.
- Для выбора операции используй \`if\` и \`else\`. Можно вложить одно условие в другое.
- В начале программы коротко объясни в комментарии, что она делает.

### Пример

Если введены \`8\`, \`*\` и \`3\`, программа печатает \`24\`.`,
    starterCode: `# Консольный калькулятор
first = float(input("Первое число: "))
operation = input("Операция: ")
second = float(input("Второе число: "))

# Напиши проверку операции и выведи результат
`,
    testCode: `for inputs, expected in [
    (['8', '*', '3'], 24),
    (['10', '-', '7'], 3),
    (['5', '+', '6'], 11),
    (['20', '/', '4'], 5),
]:
    case_output, _ = run_case(inputs=inputs)
    assert float(case_output.strip().split()[-1]) == expected

case_output, _ = run_case(inputs=['7', '/', '0'])
assert 'нол' in case_output.lower()

case_output, _ = run_case(inputs=['7', '^', '2'])
assert 'операц' in case_output.lower()`,
  },
  {
    slug: "multiplication-table",
    title: "Таблица умножения",
    topic: "for и range()",
    order: 2,
    specification: `## Техническое задание

Сделай программу, которая строит таблицу умножения для одного числа.

1. Спроси число у пользователя.
2. С помощью \`for\` и \`range()\` выведи десять строк: от умножения на 1 до умножения на 10.
3. Каждая строка должна быть понятной, например: \`7 * 3 = 21\`.

### Дополнение

Попроси пользователя выбрать, до какого числа строить таблицу, а не используй только 10.`,
    starterCode: `number = int(input("Число: "))
limit = int(input("До какого множителя: "))

# Напечатай таблицу умножения
`,
    testCode: `for inputs, expected in [
    (['7', '3'], ['7 * 1 = 7', '7 * 2 = 14', '7 * 3 = 21']),
    (['2', '1'], ['2 * 1 = 2']),
    (['-3', '4'], ['-3 * 1 = -3', '-3 * 2 = -6', '-3 * 3 = -9', '-3 * 4 = -12']),
]:
    case_output, _ = run_case(inputs=inputs)
    assert case_output.strip().splitlines() == expected`,
  },
  {
    slug: "money-box",
    title: "Копилка до цели",
    topic: "while",
    order: 3,
    specification: `## Техническое задание

Сделай программу-копилку.

1. Спроси, сколько звезд или рублей нужно накопить.
2. Начни с нуля и в цикле \`while\` спрашивай, сколько добавить сейчас.
3. После каждого шага показывай, сколько уже накоплено.
4. Когда цель достигнута, напечатай поздравление.

### Что проверить

- Цикл должен завершаться, когда накоплено ровно столько, сколько нужно, или больше.
- Программа не должна зацикливаться: внутри \`while\` обязательно меняй сумму.`,
    starterCode: `goal = int(input("Цель: "))
saved = 0

# В цикле while спрашивай, сколько добавить в копилку
`,
    testCode: `for inputs, expected in [
    (['10', '3', '4', '3'], 10),
    (['7', '8'], 8),
    (['15', '5', '6', '7'], 18),
]:
    case_output, values = run_case(inputs=inputs)
    assert values['saved'] == expected
    assert str(expected) in case_output
    assert 'цель' in case_output.lower()`,
  },
  {
    slug: "shopping-list",
    title: "Список покупок",
    topic: "Списки и for",
    order: 4,
    specification: `## Техническое задание

Сделай помощник для списка покупок.

1. Создай список минимум из трех покупок.
2. Добавь в него еще одну покупку через \`append()\`.
3. Выведи количество покупок с помощью \`len()\`.
4. С помощью \`for\` напечатай каждую покупку с новой строки.

### Дополнение

Перед выводом добавь нумерацию: \`1. хлеб\`, \`2. молоко\` и так далее.`,
    starterCode: `items = ['хлеб', 'молоко', 'яблоки']

# Добавь одну покупку, выведи количество и весь список через for
`,
    testCode: `for items in [
    ['хлеб', 'молоко', 'яблоки'],
    ['чай'],
    ['карандаш', 'тетрадь'],
]:
    case_output, values = run_case(items=items)
    assert len(values['items']) == len(items) + 1
    assert str(len(items) + 1) in case_output
    for item in values['items']:
        assert item in case_output`,
  },
];

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const readLessonContent = (file: string) => readFile(new URL(`../content/python/${file}`, import.meta.url), "utf8");

const taskData = (item: CodeTask) => ({
  kind: "CODE",
  starterCode: item.starterCode,
  testCode: item.testCode,
}) as Prisma.InputJsonValue;

async function syncTasks(lessonId: string, definitions: CodeTask[], replace: boolean, refresh: boolean) {
  const homework = await prisma.homework.upsert({ where: { lessonId }, update: {}, create: { lessonId }, include: { tasks: { include: { submissions: true } } } });
  if (homework.tasks.length > 0 && !replace && !refresh) return;
  await prisma.$transaction(async (tx) => {
    if (replace) {
      await tx.task.deleteMany({ where: { homeworkId: homework.id } });
      await tx.task.createMany({ data: definitions.map((item, order) => ({ homeworkId: homework.id, kind: "CODE", title: item.title, prompt: item.prompt, data: taskData(item), order })) });
      return;
    }

    for (const [order, item] of definitions.entries()) {
      const existing = homework.tasks.find((task) => task.order === order);
      if (existing) {
        await tx.task.update({ where: { id: existing.id }, data: { title: item.title, prompt: item.prompt, data: taskData(item) } });
      } else {
        await tx.task.create({ data: { homeworkId: homework.id, kind: "CODE", title: item.title, prompt: item.prompt, data: taskData(item), order } });
      }
    }
  });
}

async function main() {
  const course = await prisma.course.upsert({ where: { slug: "python" }, update: {}, create: { slug: "python", title: "Python", icon: "🐍" } });
  for (const definition of lessons) {
    const content = await readLessonContent(definition.file);
    const lesson = await prisma.lesson.upsert({ where: { courseId_slug: { courseId: course.id, slug: definition.slug } }, update: { title: definition.title, content, order: definition.order }, create: { courseId: course.id, slug: definition.slug, title: definition.title, content, order: definition.order } });
    if (definition.tasks) await syncTasks(lesson.id, definition.tasks, definition.replaceTasks ?? false, definition.refreshTasks ?? false);
  }
  for (const definition of projects) {
    await prisma.project.upsert({
      where: { courseId_slug: { courseId: course.id, slug: definition.slug } },
      update: {
        title: definition.title,
        topic: definition.topic,
        specification: definition.specification,
        starterCode: definition.starterCode,
        testCode: definition.testCode,
        order: definition.order,
      },
      create: { courseId: course.id, ...definition },
    });
  }
}

main().then(() => console.log("Учебная программа синхронизирована.")).catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
