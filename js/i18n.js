/* Мови (uk / ru / en) і тема (світла / темна).
   Статичні тексти сторінки: рядок [uk, ru, en]; ключ — український текст, як він стоїть у index.html.
   Тексти, які створюють скрипти: DYN (I18N.t) та INFO (I18N.info). Нові рядки додавайте сюди. */
(function () {
  "use strict";
  const LANGS = ["uk", "ru", "en"], LOC = { uk: "uk-UA", ru: "ru-RU", en: "en-US" };

  const S = [
    ["Ангари під ключ: арочні, прямокутні, утеплені, навіси — AGROSTEEL", "Ангары под ключ: арочные, прямоугольные, утеплённые, навесы — AGROSTEEL", "Turnkey hangars: arched, rectangular, insulated, canopies — AGROSTEEL"],
    ["Будівництво арочних ангарів для зерна, техніки та складів. Ширина 12–18 м, довжина за бажанням. Ціни 2026–2027, гарантія 10 років, виїзд на замір безкоштовно.", "Строительство арочных ангаров для зерна, техники и складов. Ширина 12–18 м, длина по желанию. Цены 2026–2027, гарантия 10 лет, выезд на замер бесплатно.", "Arched hangars for grain, machinery and storage. 12–18 m wide, any length you need. 2026–2027 prices, 10-year warranty, free site visit for measuring."],
    ["Головне меню", "Главное меню", "Main menu"], ["Мова", "Язык", "Language"], ["Тема сайту", "Тема сайта", "Site theme"],
    ["Ціни", "Цены", "Prices"], ["Бетон", "Бетон", "Concrete"], ["3D-моделі", "3D-модели", "3D models"], ["Роботи", "Работы", "Projects"], ["Галерея", "Галерея", "Gallery"],
    ["Про нас", "О нас", "About us"], ["Блог", "Блог", "Blog"], ["Контакти", "Контакты", "Contacts"],
    ["Відкрити меню", "Открыть меню", "Open menu"],
    ["Швидкий перехід", "Быстрый переход", "Quick jump"], ["Фотогалерея", "Фотогалерея", "Photo gallery"], ["Форма для зв'язку", "Форма для связи", "Contact form"], ["Прорахунок", "Расчёт", "Estimate"], ["Прайс", "Прайс", "Price list"],
    ["Фотогалерея наших ангарів", "Фотогалерея наших ангаров", "Gallery of our hangars"], ["Завершені об'єкти. Натисніть на фото, щоб відкрити на весь екран.", "Завершённые объекты. Нажмите на фото, чтобы открыть на весь экран.", "Completed projects. Tap a photo to open it full screen."],
    ["Залишити заявку", "Оставить заявку", "Send a request"], ["Ім'я", "Имя", "Name"], ["Телефон", "Телефон", "Phone"], ["Що потрібно збудувати", "Что нужно построить", "What you need built"], ["Надіслати заявку", "Отправить заявку", "Send request"], ["Введіть символи з картинки", "Введите символы с картинки", "Type the characters from the image"], ["Оновити капчу", "Обновить капчу", "Refresh captcha"], ["Капча", "Капча", "Captcha"],
    ["Арочні ангари під ключ", "Арочные ангары под ключ", "Turnkey arched hangars"],
    ["Зерносховища, склади, ангари для техніки. Фундамент, каркас і покриття — одна бригада, фіксована ціна за розмір.", "Зернохранилища, склады, ангары для техники. Фундамент, каркас и покрытие — одна бригада, фиксированная цена за размер.", "Grain stores, warehouses, machinery sheds. Foundation, frame and cladding by one crew, with a fixed price per size."],
    ["Порахувати вартість", "Рассчитать стоимость", "Calculate the cost"], ["Подивитись у 3D", "Посмотреть в 3D", "View in 3D"],
    ["Що будуємо", "Что строим", "What we build"], ["Зерносховища", "Зернохранилища", "Grain stores"], ["Склади", "Склады", "Warehouses"],
    ["Гаражі для техніки", "Гаражи для техники", "Machinery sheds"], ["Цехи", "Цеха", "Workshops"], ["Навіси", "Навесы", "Canopies"], ["Сіносховища", "Сеносклады", "Hay barns"],
    ["Ширина 12, 15 або 18 м · довжина за бажанням · ціни 2026–2027 · гарантія 10 років", "Ширина 12, 15 или 18 м · длина по желанию · цены 2026–2027 · гарантия 10 лет", "Width 12, 15 or 18 m · any length you need · 2026–2027 prices · 10-year warranty"],
    ["Арочний ангар із оцинкованого профнастилу", "Арочный ангар из оцинкованного профнастила", "Arched hangar made of galvanized corrugated sheet"],
    ["Під ключ", "Под ключ", "Turnkey"],
    ["Від фундаменту до воріт. Не потрібно шукати окремих підрядників.", "От фундамента до ворот. Не нужно искать отдельных подрядчиков.", "From the foundation to the gates. No need to look for separate contractors."],
    ["Без колон усередині", "Без колонн внутри", "No columns inside"],
    ["Посередині немає стовпів: зерну, техніці й палетам вистачає місця.", "Посередине нет столбов: зерну, технике и паллетам хватает места.", "No posts in the middle: plenty of room for grain, machinery and pallets."],
    ["Профнастил із Туреччини", "Профнастил из Турции", "Profile sheet from Turkey"],
    ["Профільний лист турецького виробництва, товщина 0,5 мм. Оцинкований, не гниє, за бажанням — полімерне покриття.", "Профильный лист турецкого производства, толщина 0,5 мм. Оцинкованный, не гниёт, по желанию — полимерное покрытие.", "Corrugated sheet made in Turkey, 0.5 mm thick. Galvanized, does not rot, polymer coating on request."],
    ["Швидкий монтаж", "Быстрый монтаж", "Fast assembly"],
    ["Професійний монтаж із дотриманням технологій, у найкоротші терміни.", "Профессиональный монтаж с соблюдением технологий, в кратчайшие сроки.", "Professional assembly that follows the technology, in the shortest possible time."],
    ["Не порівнюйте нас із безкаркасними ангарами", "Не сравнивайте нас с бескаркасными ангарами", "Don’t compare us with frameless hangars"],
    ["Ми зварюємо повноцінні арки, обшиваємо їх брусом 50×50 і додатково обробляємо конструкцію. Безкаркасні рішення поступаються за надійністю й опрацюванням.", "Мы свариваем полноценные арки, обшиваем их брусом 50×50 и дополнительно обрабатываем конструкцию. Бескаркасные решения уступают по надёжности и проработке.", "We weld full arches, clad them with 50×50 timber and give the structure extra treatment. Frameless solutions fall short in reliability and detailing."],
    ["Зварні арки", "Сварные арки", "Welded arches"],
    ["Кожна арка складається з 3 частин. Між арками 2,5 м.", "Каждая арка состоит из 3 частей. Между арками 2,5 м.", "Each arch is made of 3 parts. The arches are 2.5 m apart."],
    ["Брус 50×50", "Брус 50×50", "50×50 timber"],
    ["Арки обшиваємо брусом 50×50, потім кладемо профнастил.", "Арки обшиваем брусом 50×50, затем кладём профнастил.", "We clad the arches with 50×50 timber, then lay the sheet."],
    ["Обробка конструкції", "Обработка конструкции", "Structure treatment"],
    ["Конструкцію додатково обробляємо: у цьому наша різниця з безкаркасними рішеннями.", "Конструкцию дополнительно обрабатываем: в этом наше отличие от бескаркасных решений.", "The structure gets extra treatment, which is what sets us apart from frameless solutions."],
    ["Тимчасова споруда", "Временное сооружение", "Temporary structure"],
    ["Наші ангари оформляються як тимчасові споруди, тому складні дозвільні документи не потрібні, на відміну від безкаркасних.", "Наши ангары оформляются как временные сооружения, поэтому для них не требуются сложные разрешительные документы, в отличие от бескаркасных.", "Our hangars are registered as temporary structures, so no complicated permits are needed, unlike frameless ones."],
    ["10 років", "10 лет", "10 years"], ["гарантії на ангар", "гарантии на ангар", "warranty on the hangar"],
    ["Виїзд безкоштовно", "Выезд бесплатно", "Free site visit"],
    ["приїжджаємо на місце, робимо замір, оглядаємо майданчик й оцінюємо роботи", "приезжаем на место, делаем замер, осматриваем площадку и оцениваем работы", "we come to the site, measure, inspect the plot and estimate the work"],
    ["Який ангар підійде вам", "Какой ангар подойдёт вам", "Which hangar suits you"],
    ["Тип залежить від того, що і як ви зберігаєте. Підкажемо до розрахунку.", "Тип зависит от того, что и как вы храните. Подскажем до расчёта.", "The type depends on what and how you store. We will advise before the estimate."],
    ["Зерно й техніка", "Зерно и техника", "Grain and machinery"],
    ["Арочний: вільний простір без колон, швидкий монтаж.", "Арочный: свободное пространство без колонн, быстрый монтаж.", "Arched: open space without columns, fast assembly."],
    ["Склад і виробництво", "Склад и производство", "Storage and production"],
    ["Прямокутний: високі ворота, стелажі вздовж стін.", "Прямоугольный: высокие ворота, стеллажи вдоль стен.", "Rectangular: tall gates, racking along the walls."],
    ["Цех і опалюваний склад", "Цех и отапливаемый склад", "Workshop and heated warehouse"],
    ["Утеплений із сендвіч-панелей: тримає температуру.", "Утеплённый из сэндвич-панелей: держит температуру.", "Insulated, from sandwich panels: keeps the temperature."],
    ["Сіно й техніка", "Сено и техника", "Hay and machinery"],
    ["Навіс: найпростіша й найшвидша конструкція.", "Навес: самая простая и быстрая конструкция.", "Canopy: the simplest and fastest structure."],
    ["Усі види ангарів у 3D", "Все виды ангаров в 3D", "All hangar types in 3D"],
    ["Обертайте модель мишкою або пальцем, колесом змінюйте масштаб. Моделі умовні: показують форму й конструкцію. Точні розміри й креслення — після розрахунку.", "Вращайте модель мышью или пальцем, колесом меняйте масштаб. Модели условные: показывают форму и конструкцию. Точные размеры и чертежи — после расчёта.", "Rotate the model with the mouse or a finger, zoom with the wheel. Models are schematic: they show shape and structure. Exact sizes and drawings come after the estimate."],
    ["Вид ангара", "Вид ангара", "Hangar type"], ["Тип ангара", "Тип ангара", "Hangar type"],
    ["Арочний", "Арочный", "Arched"], ["Прямокутний", "Прямоугольный", "Rectangular"], ["Утеплений", "Утеплённый", "Insulated"], ["Навіс", "Навес", "Canopy"],
    ["Показати каркас", "Показать каркас", "Show frame"], ["Потягніть, щоб обертати", "Потяните, чтобы вращать", "Drag to rotate"],
    ["Арочний ангар", "Арочный ангар", "Arched hangar"], ["Замовити розрахунок", "Заказать расчёт", "Request an estimate"],
    ["Ціни на ангари 2026–2027", "Цены на ангары 2026–2027", "Hangar prices 2026–2027"],
    ["Розмір записується як ширина–довжина в метрах. Довжина за бажанням. Ціна вказана за ангар у зборі разом із розпашними воротами (висота 4,5 м, ширина 6 м). Відкатні ворота оплачуються окремо, фундамент уточнюється під ваш майданчик.", "Размер записывается как ширина–длина в метрах. Длина по желанию. Цена указана за ангар в сборе вместе с распашными воротами (высота 4,5 м, ширина 6 м). Откатные ворота оплачиваются отдельно, фундамент уточняется под вашу площадку.", "Size is width × length in metres. Any length you need. The price is for the assembled hangar including swing gates (4.5 m high, 6 m wide). Sliding gates are paid separately; the foundation is quoted for your site."],
    ["Калькулятор", "Калькулятор", "Calculator"],
    ["Ширина, м", "Ширина, м", "Width, m"], ["Відкатні ворота (окремо)", "Откатные ворота (отдельно)", "Sliding gates (extra)"],
    ["Без відкатних", "Без откатных", "No sliding gates"], ["Збоку, 1 шт. (+50 000 грн)", "Сбоку, 1 шт. (+50 000 грн)", "On the side, 1 pc (+50,000 UAH)"],
    ["Збоку, 2 шт. (+100 000 грн)", "Сбоку, 2 шт. (+100 000 грн)", "On both sides, 2 pcs (+100,000 UAH)"], ["У торці, 1 шт. (+50 000 грн)", "В торце, 1 шт. (+50 000 грн)", "At the end, 1 pc (+50,000 UAH)"],
    ["Розпашні ворота входять у ціну. Відкатні робимо в торці або врізаємо збоку.", "Распашные ворота входят в цену. Откатные делаем в торце или врезаем сбоку.", "Swing gates are included in the price. Sliding gates go in the end wall or are cut into the side."],
    ["Ширина:", "Ширина:", "Width:"], ["м", "м", "m"], ["Довжина:", "Длина:", "Length:"], ["Висота стін:", "Высота стен:", "Wall height:"],
    ["4 000 грн за м² площі. Ворота для прямокутних ангарів уточнюйте за телефоном.", "4 000 грн за м² площади. Ворота для прямоугольных ангаров уточняйте по телефону.", "4,000 UAH per m² of floor area. Gates for rectangular hangars: please ask by phone."],
    ["Замовити цей розмір", "Заказать этот размер", "Order this size"],
    ["Колір покриття", "Цвет покрытия", "Cladding colour"], ["Оцинковка", "Оцинковка", "Galvanized"], ["Графіт", "Графит", "Graphite"], ["Зелений", "Зелёный", "Green"],
    ["Скинути вигляд", "Сбросить вид", "Reset view"],
    ["Тягніть, щоб обертати. Жовта фігурка — людина 1,8 м. Колір і висота орієнтовні.", "Тяните, чтобы вращать. Жёлтая фигурка — человек 1,8 м. Цвет и высота ориентировочные.", "Drag to rotate. The yellow figure is a 1.8 m person. Colour and height are approximate."],
    ["Прайс на арочні ангари", "Прайс на арочные ангары", "Arched hangar price list"],
    ["Розмір, м", "Размер, м", "Size, m"], ["Площа, м²", "Площадь, м²", "Area, m²"], ["Ціна за м², грн", "Цена за м², грн", "Price per m², UAH"], ["Вартість, грн", "Стоимость, грн", "Cost, UAH"], ["Вибрати", "Выбрать", "Select"],
    ["У таблиці типові розміри. Потрібна інша довжина: оберіть її в калькуляторі, точну ціну назвемо після розрахунку.", "В таблице типовые размеры. Нужна другая длина: выберите её в калькуляторе, точную цену назовём после расчёта.", "The table lists typical sizes. Need another length? Pick it in the calculator; we will confirm the exact price after the estimate."],
    ["Ворота розпашні", "Ворота распашные", "Swing gates"], ["Входять у ціну ангара. Стандарт: висота 4,5 м, ширина 6 м.", "Входят в цену ангара. Стандарт: высота 4,5 м, ширина 6 м.", "Included in the hangar price. Standard: 4.5 m high, 6 m wide."],
    ["Ворота відкатні", "Ворота откатные", "Sliding gates"], ["+50 000 грн, оплачуються окремо. Стандарт: висота 4,5 м, ширина 6 м.", "+50 000 грн, оплачиваются отдельно. Стандарт: высота 4,5 м, ширина 6 м.", "+50,000 UAH, paid separately. Standard: 4.5 m high, 6 m wide."],
    ["Відкатні збоку", "Откатные сбоку", "Sliding on the side"], ["Робимо відкатні ворота не лише в торці: можемо врізати й збоку ангара.", "Делаем откатные ворота не только в торце: можем врезать и сбоку ангара.", "We make sliding gates not only in the end wall: we can also cut them into the side of the hangar."],
    ["Прямокутні ангари", "Прямоугольные ангары", "Rectangular hangars"],
    ["4 000 грн за м². Розмір обираєте у калькуляторі.", "4 000 грн за м². Размер выбираете в калькуляторе.", "4,000 UAH per m². Pick the size in the calculator."],
    ["Робимо бетонні роботи", "Делаем бетонные работы", "We do concrete work"],
    ["Опалубка й бетонні підлоги: під ангар, склад чи цех.", "Опалубка и бетонные полы: под ангар, склад или цех.", "Formwork and concrete floors for a hangar, warehouse or workshop."],
    ["Опалубка", "Опалубка", "Formwork"], ["Встановлюємо опалубку й заливаємо її бетоном.", "Устанавливаем опалубку и заливаем её бетоном.", "We install the formwork and pour concrete into it."],
    ["Підлоги", "Полы", "Floors"], ["Бетонні підлоги для ангарів, складів і цехів.", "Бетонные полы для ангаров, складов и цехов.", "Concrete floors for hangars, warehouses and workshops."],
    ["4 100 грн/м²", "4 100 грн/м²", "4,100 UAH/m²"], ["Заливка опалубки: за цією ж ціною.", "Заливка опалубки: по той же цене.", "Pouring the formwork: at the same price."],
    ["Як росте ангар", "Как растёт ангар", "How a hangar grows"],
    ["Кожен об'єкт іде одним шляхом: від першої арки до готових воріт. Натисніть на фото чи відео, щоб відкрити на весь екран.", "Каждый объект идёт одним путём: от первой арки до готовых ворот. Нажмите на фото или видео, чтобы открыть на весь экран.", "Every project follows one path: from the first arch to the finished gates. Click a photo or video to open it full screen."],
    ["Каркас", "Каркас", "Frame"],
    ["Арки зварюємо з металевого профілю: кожна складається з 3 частин, між арками 2,5 м. Обшиваємо брусом 50×50. Усередині немає колон, тож під зерно чи техніку лишається вільний простір.", "Арки сваривают из металлического профиля: каждая состоит из 3 частей, между арками 2,5 м. Обшиваем брусом 50×50. Внутри нет колонн, поэтому под зерно или технику остаётся свободное место.", "Arches are welded from steel profile: each is made of 3 parts, with 2.5 m between arches. They are clad with 50×50 timber. There are no columns inside, so the space stays free for grain or machinery."],
    ["Каркас зблизька", "Каркас вблизи", "The frame up close"],
    ["Відео з об'єкта: стійки на анкерах у бетонному цоколі, зварні арки й дерев'яна обрешітка.", "Видео с объекта: стойки на анкерах в бетонном цоколе, сварные арки и деревянная обрешётка.", "Video from a site: posts anchored to the concrete plinth, welded arches and a timber lathing."],
    ["Відкрити фото", "Открыть фото", "Open photo"], ["Відкрити відео", "Открыть видео", "Open video"],
    ["Металевий каркас арки з дерев'яними прогонами", "Металлический каркас арки с деревянными прогонами", "Steel arch frame with wooden purlins"],
    ["Робота на висоті", "Работа на высоте", "Work at height"],
    ["Збірка й зварювання відбуваються прямо на майданчику. Одна бригада від каркаса до воріт, тому терміни й відповідальність в одних руках.", "Сборка и сварка выполняются прямо на площадке. Одна бригада от каркаса до ворот, поэтому сроки и ответственность в одних руках.", "Assembly and welding happen right on site. One crew from frame to gates, so timing and responsibility stay in one pair of hands."],
    ["Обшивка", "Обшивка", "Cladding"],
    ["Каркас закриваємо профнастилом: оцинкованим або з полімерним покриттям. Далі розпашні ворота (входять у ціну), хвіртка й вентиляційні жалюзі. Відкатні ворота робимо окремо: у торці або збоку.", "Каркас закрываем профнастилом: оцинкованным или с полимерным покрытием. Далее распашные ворота (входят в цену), калитка и вентиляционные жалюзи. Откатные ворота делаем отдельно: в торце или сбоку.", "The frame is covered with corrugated sheet, galvanized or polymer-coated. Then the swing gates (included in the price), wicket door and ventilation louvres. Sliding gates are made separately: in the end wall or on the side."],
    ["Довгий арочний ангар на етапі обшивки", "Длинный арочный ангар на этапе обшивки", "Long arched hangar during cladding"],
    ["Торець ангара з воротами та хвірткою", "Торец ангара с воротами и калиткой", "Hangar end wall with gates and a wicket door"],
    ["Профнастил з полімерним покриттям", "Профнастил с полимерным покрытием", "Polymer-coated corrugated sheet"],
    ["Готовий ангар", "Готовый ангар", "Finished hangar"],
    ["Склад у полі, зерносховище, гараж для техніки. Розмір і колір підбираємо під вашу задачу.", "Склад в поле, зернохранилище, гараж для техники. Размер и цвет подбираем под вашу задачу.", "A field warehouse, grain store or machinery shed. We choose size and colour for your task."],
    ["Готовий ангар у полі", "Готовый ангар в поле", "Finished hangar in a field"],
    ["Двосхилий ангар із сірого профнастилу", "Двускатный ангар из серого профнастила", "Gable hangar made of grey corrugated sheet"],
    ["Не знайшли свій розмір? Скажіть, що зберігатимете, і ми підберемо ширину та довжину.", "Не нашли свой размер? Скажите, что будете хранить, и мы подберём ширину и длину.", "Can’t find your size? Tell us what you will store and we will pick the width and length."],
    ["Отримати розрахунок", "Получить расчёт", "Get an estimate"], ["Перегляд", "Просмотр", "Preview"],
    ["Як ми працюємо", "Как мы работаем", "How we work"], ["Заявка", "Заявка", "Request"],
    ["Телефонуєте або залишаєте заявку. Називаєте розмір і призначення.", "Звоните или оставляете заявку. Называете размер и назначение.", "You call or leave a request and name the size and purpose."],
    ["Розрахунок", "Расчёт", "Estimate"],
    ["Безкоштовно виїжджаємо на місце, міряємо й оцінюємо. Підтверджуємо ціну й терміни, узгоджуємо договір.", "Бесплатно выезжаем на место, измеряем и оцениваем. Подтверждаем цену и сроки, согласуем договор.", "We visit the site free of charge, measure and assess. We confirm price and timing and agree the contract."],
    ["Фундамент", "Фундамент", "Foundation"], ["Заливаємо стрічковий фундамент під арки.", "Заливаем ленточный фундамент под арки.", "We pour a strip foundation for the arches."],
    ["Зварюємо арки з 3 частин із кроком 2,5 м, обшиваємо брусом 50×50.", "Свариваем арки из 3 частей с шагом 2,5 м, обшиваем брусом 50×50.", "We weld arches made of 3 parts, 2.5 m apart, and clad them with 50×50 timber."],
    ["Покриття й ворота", "Покрытие и ворота", "Cladding and gates"],
    ["Обшиваємо профнастилом, встановлюємо ворота й вентиляцію.", "Обшиваем профнастилом, устанавливаем ворота и вентиляцию.", "We clad with corrugated sheet and fit the gates and ventilation."],
    
    ["Оплата карткою: перейти до контактів", "Оплата картой: перейти к контактам", "Card payment: go to contacts"],
    ["AGROSTEEL працює з 2015 року. Компанію створили в Мелітополі, після початку війни ми перенесли роботу до Запоріжжя, а згодом, через бойові дії, до Білої Церкви. Будівництво не зупиняли.", "AGROSTEEL работает с 2015 года. Компанию создали в Мелитополе, после начала войны мы перенесли работу в Запорожье, а затем, из-за боевых действий, в Белую Церковь. Строительство не останавливали.", "AGROSTEEL has worked since 2015. The company was founded in Melitopol; after the war began we moved to Zaporizhzhia and later, because of the fighting, to Bila Tserkva. We never stopped building."],
    ["Будуємо арочні та прямокутні ангари, утеплені склади й навіси, робимо бетонні підлоги й опалубку. Працюємо по всій Україні. Гарантія на ангар 10 років, виїзд на замір безкоштовний.", "Строим арочные и прямоугольные ангары, утеплённые склады и навесы, делаем бетонные полы и опалубку. Работаем по всей Украине. Гарантия на ангар 10 лет, выезд на замер бесплатный.", "We build arched and rectangular hangars, insulated warehouses and canopies, and do concrete floors and formwork. We work all over Ukraine. 10-year warranty on the hangar, free site visit for measuring."],
    ["Підберемо тип ангара", "Подберём тип ангара", "We will pick the hangar type"],
    ["Арочний, прямокутний, утеплений чи навіс: залежить від того, що ви зберігаєте.", "Арочный, прямоугольный, утеплённый или навес: зависит от того, что вы храните.", "Arched, rectangular, insulated or canopy: it depends on what you store."],
    ["Підкажемо вигідний розмір", "Подскажем выгодный размер", "We will suggest a cost-effective size"],
    ["Деякі розміри обходяться дешевше за м². Покажемо, де саме.", "Некоторые размеры обходятся дешевле за м². Покажем, какие именно.", "Some sizes cost less per m². We will show you which."],
    ["Назвемо терміни й умови", "Назовём сроки и условия", "We will state timing and terms"],
    ["Скільки триває будівництво і на яких умовах працюємо.", "Сколько длится строительство и на каких условиях работаем.", "How long construction takes and on what terms we work."],
    ["Розкажемо про підготовку майданчика", "Расскажем о подготовке площадки", "We will explain site preparation"],
    ["Що зробити до приїзду бригади.", "Что сделать до приезда бригады.", "What to do before the crew arrives."],
    ["Блог і соцмережі", "Блог и соцсети", "Blog and social media"],
    ["Нові об'єкти, відео монтажу й корисне про будівництво ангарів.", "Новые объекты, видео монтажа и полезное о строительстве ангаров.", "New projects, assembly videos and useful tips on building hangars."],
    ["Короткі відео з майданчиків: від каркаса до готового ангара.", "Короткие видео с площадок: от каркаса до готового ангара.", "Short videos from the sites: from the frame to the finished hangar."],
    ["Фото готових об'єктів і життя бригади.", "Фото готовых объектов и жизнь бригады.", "Photos of finished projects and life of the crew."],
    ["Зв'яжіться з нами", "Свяжитесь с нами", "Contact us"],
    ["Зателефонуйте: уточнимо розмір і назвемо остаточну ціну.", "Позвоните: уточним размер и назовём окончательную цену.", "Call us: we will confirm the size and name the final price."],
    ["093 234-85-11 · Денис", "093 234-85-11 · Денис", "093 234-85-11 · Denis"], ["096 614-34-55 · Роман", "096 614-34-55 · Роман", "096 614-34-55 · Roman"],
    ["Телефони", "Телефоны", "Phones"], ["Денис: 093 234-85-11", "Денис: 093 234-85-11", "Denis: 093 234-85-11"], ["Роман: 096 614-34-55", "Роман: 096 614-34-55", "Roman: 096 614-34-55"],
    ["Соцмережі", "Соцсети", "Social media"], ["Де ми", "Где мы", "Where we are"],
    ["м. Біла Церква. Працюємо по всій Україні.", "г. Белая Церковь. Работаем по всей Украине.", "Bila Tserkva. We work all over Ukraine."],
    ["Виїзд на замір безкоштовний.", "Выезд на замер бесплатный.", "Free site visit for measuring."],
    ["Готівковий та безготівковий розрахунок", "Наличный и безналичный расчёт", "Cash and bank-transfer payment"], ["· м. Біла Церква ·", "· г. Белая Церковь ·", "· Bila Tserkva ·"], ["Нагору", "Наверх", "Back to top"],
    ["Денис 093 234-85-11", "Денис 093 234-85-11", "Denis 093 234-85-11"], ["Роман 096 614-34-55", "Роман 096 614-34-55", "Roman 096 614-34-55"]
  ];

  // Тексти зі скриптів
  const DYN = {
    m: ["м", "м", "m"], m2: ["м²", "м²", "m²"], uah: ["грн", "грн", "UAH"], pick: ["Обрати", "Выбрать", "Select"],
    grp: ["Ширина {w} м", "Ширина {w} м", "Width {w} m"], perm2: ["грн за м²", "грн за м²", "UAH per m²"],
    approx: ["ціна орієнтовна", "цена ориентировочная", "approximate price"], gates: ["з відкатними воротами", "с откатными воротами", "with sliding gates"], walls: ["стіни", "стены", "walls"],
    showFrame: ["Показати каркас", "Показать каркас", "Show frame"], showSkin: ["Показати обшивку", "Показать обшивку", "Show cladding"],
    cvAria: ["3D-модель ангара: тягніть, щоб обертати", "3D-модель ангара: тяните, чтобы вращать", "3D hangar model: drag to rotate"],
    fail2: ["3D-модель недоступна у цьому браузері. Розміри — у підписі нижче.", "3D-модель недоступна в этом браузере. Размеры — в подписи ниже.", "The 3D model is not available in this browser. Sizes are in the caption below."],
    lgA: ["Ширина {w} м · довжина {l} м · висота ≈ {h} м · площа {a} м²", "Ширина {w} м · длина {l} м · высота ≈ {h} м · площадь {a} м²", "Width {w} m · length {l} m · height ≈ {h} m · area {a} m²"],
    lgR: ["Ширина {w} м · довжина {l} м · стіни {h} м · до коника ≈ {r} м · площа {a} м²", "Ширина {w} м · длина {l} м · стены {h} м · до конька ≈ {r} м · площадь {a} м²", "Width {w} m · length {l} m · walls {h} m · to ridge ≈ {r} m · area {a} m²"]
  };
  const INFO = {
    arch: [
      ["Арочний ангар", "Арочный ангар", "Arched hangar"],
      ["Зварні фермові арки з 3 частин: два пояси з розкосами, крок між арками 2,5 м. Обшивка брусом 50×50, профнастил уздовж дуги. Без колон усередині: найшвидший у монтажі й зазвичай вигідніший за ціною м².", "Сварные ферменные арки из 3 частей: два пояса с раскосами, шаг между арками 2,5 м. Обшивка брусом 50×50, профнастил вдоль дуги. Без колонн внутри: самый быстрый в монтаже и обычно выгоднее по цене за м².", "Welded truss arches made of 3 parts: two chords with diagonals, 2.5 m between arches. Clad with 50×50 timber, sheet running along the arc. No columns inside: the fastest to assemble and usually cheaper per m²."],
      ["На моделі: 18×40 м, висота ≈ 9,9 м", "На модели: 18×40 м, высота ≈ 9,9 м", "Model: 18×40 m, height ≈ 9.9 m"]],
    straight: [
      ["Прямокутний ангар", "Прямоугольный ангар", "Rectangular hangar"],
      ["Портальні рами з двотаврів кожні 5 м, прогони даху й ригелі стін, двосхилий дах. Вертикальні стіни дають більше корисного об'єму, дозволяють високі ворота й стелажі.", "Портальные рамы из двутавров каждые 5 м, прогоны крыши и ригели стен, двускатная крыша. Вертикальные стены дают больше полезного объёма, позволяют высокие ворота и стеллажи.", "Portal I-beam frames every 5 m, roof purlins and wall girts, gable roof. Vertical walls give more usable volume and allow tall gates and racking."],
      ["На моделі: 20×40 м, до коника ≈ 8,3 м", "На модели: 20×40 м, до конька ≈ 8,3 м", "Model: 20×40 m, to ridge ≈ 8.3 m"]],
    warm: [
      ["Утеплений ангар", "Утеплённый ангар", "Insulated hangar"],
      ["Каркас той самий, обшивка — сендвіч-панелі з утеплювачем із видимими швами, цоколь, смуга вікон, секційні ворота й двері. Для цехів і опалюваних складів.", "Каркас тот же, обшивка — сэндвич-панели с утеплителем с видимыми швами, цоколь, полоса окон, секционные ворота и двери. Для цехов и отапливаемых складов.", "Same frame, clad with insulated sandwich panels with visible joints, plinth, window strip, sectional gates and door. For workshops and heated warehouses."],
      ["На моделі: 16×36 м, до коника ≈ 6,8 м", "На модели: 16×36 м, до конька ≈ 6,8 м", "Model: 16×36 m, to ridge ≈ 6.8 m"]],
    canopy: [
      ["Навіс", "Навес", "Canopy"],
      ["Колони, односхилі ґратчасті ферми й покрівля з профнастилу. Відкритий з усіх боків: для техніки та сіна. Найпростіший і найшвидший у зведенні.", "Колонны, односкатные решётчатые фермы и кровля из профнастила. Открыт со всех сторон: для техники и сена. Самый простой и быстрый в возведении.", "Columns, mono-pitch lattice trusses and a sheet roof. Open on all sides: for machinery and hay. The simplest and fastest to build."],
      ["На моделі: 15×30 м, висота 5–6,5 м", "На модели: 15×30 м, высота 5–6,5 м", "Model: 15×30 m, height 5–6.5 m"]]
  };

  const idx = new Map(S.map(r => [r[0], r]));
  const store = (k, d) => { try { return localStorage.getItem(k); } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  let lang = store("lang"); if (LANGS.indexOf(lang) < 0) lang = "uk";
  let theme = document.documentElement.dataset.theme || "light";
  let nodes = [], attrs = [];

  const I18N = window.I18N = {
    get lang() { return lang; },
    t(key, v) {
      let s = (DYN[key] || [key, key, key])[LANGS.indexOf(lang)];
      if (v) for (const k in v) s = s.replace("{" + k + "}", v[k]);
      return s;
    },
    info(k) { return INFO[k].map(r => r[LANGS.indexOf(lang)]); },
    num(n) { const s = n.toLocaleString(LOC[lang]); return lang === "en" ? s : s.replace(/[\u00a0\u202f]/g, " "); }
  };

  function tag() {
    const w = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode());) {
      if (n.parentNode.closest("script,style")) continue;
      const m = n.nodeValue.match(/^(\s*)([\s\S]*?)(\s*)$/);
      if (m[2] && idx.has(m[2])) nodes.push({ n, pre: m[1], key: m[2], post: m[3] });
    }
    document.querySelectorAll("[alt],[aria-label],[title]").forEach(el => ["alt", "aria-label", "title"].forEach(a => {
      const v = el.getAttribute(a); if (v && idx.has(v)) attrs.push({ el, a, key: v });
    }));
  }

  function setLang(l) {
    lang = l; save("lang", l);
    const i = LANGS.indexOf(l);
    document.documentElement.lang = l;
    nodes = nodes.filter(o => o.n.isConnected);
    nodes.forEach(o => { o.n.nodeValue = o.pre + idx.get(o.key)[i] + o.post; });
    attrs.forEach(o => o.el.setAttribute(o.a, idx.get(o.key)[i]));
    const md = document.querySelector('meta[name="description"]');
    if (md) md.content = idx.get(md.dataset.k || (md.dataset.k = md.content))[i];
    document.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === l)));
    window.dispatchEvent(new Event("langchange"));
  }

  function setTheme(t) {
    theme = t; save("theme", t);
    document.documentElement.dataset.theme = t;
    const logo = document.querySelector(".hero__logo");
    if (logo) logo.src = "assets/img/" + (t === "dark" ? "logo-light.png" : "logo-dark.png");
    const mt = document.querySelector('meta[name="theme-color"]');
    if (mt) mt.content = t === "dark" ? "#080c0f" : "#1c242b";
    const b = document.getElementById("themeBtn");
    if (b) b.setAttribute("aria-pressed", String(t === "dark"));
  }

  tag();
  document.querySelectorAll("[data-lang]").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));
  const tb = document.getElementById("themeBtn");
  if (tb) tb.addEventListener("click", () => setTheme(theme === "dark" ? "light" : "dark"));
  setTheme(theme);
  if (lang !== "uk") setLang(lang); else document.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.lang === "uk")));
})();
