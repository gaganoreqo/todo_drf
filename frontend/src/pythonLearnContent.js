export const pythonLearningTopics = [
  {
    id: 'syntax-runtime',
    level: 'Basic',
    title: 'Python Setup, Syntax, Runtime',
    goal: 'Understand how Python code runs and how a Python file is structured.',
    terms: [
      ['Interpreter', 'The program that reads and executes Python code line by line.'],
      ['Script', 'A .py file that can be executed from the terminal.'],
      ['Indentation', 'Whitespace that defines blocks in Python.'],
      ['Virtual environment', 'An isolated folder for project dependencies.'],
    ],
    concepts: [
      'Install Python and check python --version.',
      'Use a virtual environment for each project.',
      'Run files with python file_name.py.',
      'Use indentation instead of braces for blocks.',
      'Use comments to explain intent, not obvious syntax.',
    ],
    exampleTitle: 'First Python file',
    exampleCode: `message = "Python learning"
print(message)


def greet(name):
    return f"Hello, {name}"


print(greet("Gagan"))`,
    interview: [
      {
        q: 'Why is indentation important in Python?',
        a: 'Indentation defines code blocks. A wrong indent can change program behavior or raise an IndentationError.',
      },
      {
        q: 'Why use a virtual environment?',
        a: 'It keeps dependencies isolated per project so package versions do not conflict across apps.',
      },
    ],
  },
  {
    id: 'variables-types',
    level: 'Basic',
    title: 'Variables, Data Types, Type Conversion',
    goal: 'Use Python values correctly and convert between common types.',
    terms: [
      ['Variable', 'A name that references a value object.'],
      ['Dynamic typing', 'Python decides variable types at runtime.'],
      ['Mutable', 'Can be changed after creation, such as list and dict.'],
      ['Immutable', 'Cannot be changed after creation, such as int, str, tuple.'],
    ],
    concepts: [
      'Core types: int, float, bool, str, list, tuple, dict, set, None.',
      'Use type(value) to inspect the type.',
      'Convert values with int(), float(), str(), bool(), list().',
      'Use is for identity checks and == for value checks.',
      'Understand truthy and falsy values.',
    ],
    exampleTitle: 'Type conversion and truthiness',
    exampleCode: `age_text = "25"
age = int(age_text)

if age >= 18:
    print("adult")

items = []
if not items:
    print("list is empty")`,
    interview: [
      {
        q: 'Is Python statically typed or dynamically typed?',
        a: 'Python is dynamically typed. Types are checked at runtime, although type hints can document expected types.',
      },
      {
        q: 'What is the difference between mutable and immutable objects?',
        a: 'Mutable objects can be changed in place. Immutable objects create a new value when changed.',
      },
    ],
  },
  {
    id: 'operators-strings',
    level: 'Basic',
    title: 'Operators, Strings, Formatting',
    goal: 'Write expressions and work with text safely.',
    terms: [
      ['Arithmetic operators', '+, -, *, /, //, %, **.'],
      ['Comparison operators', '==, !=, >, <, >=, <=.'],
      ['Logical operators', 'and, or, not.'],
      ['f-string', 'Modern string formatting with embedded expressions.'],
    ],
    concepts: [
      'Use // for floor division and % for remainder.',
      'Use in to check membership.',
      'Slice strings with text[start:stop:step].',
      'Use strip(), lower(), upper(), split(), join(), replace().',
      'Prefer f-strings for readable formatting.',
    ],
    exampleTitle: 'String operations',
    exampleCode: `name = "  Python Developer  "
clean_name = name.strip().title()

skills = ["Python", "Django", "React"]
summary = ", ".join(skills)

print(f"{clean_name}: {summary}")`,
    interview: [
      {
        q: 'What does // do in Python?',
        a: 'It performs floor division and returns the quotient rounded down.',
      },
      {
        q: 'Why are f-strings commonly used?',
        a: 'They are concise, readable, and allow expressions directly inside string templates.',
      },
    ],
  },
  {
    id: 'collections',
    level: 'Basic',
    title: 'Lists, Tuples, Sets, Dictionaries',
    goal: 'Choose the right collection for ordered data, unique data, and key-value data.',
    terms: [
      ['List', 'Ordered mutable sequence.'],
      ['Tuple', 'Ordered immutable sequence.'],
      ['Set', 'Unordered collection of unique values.'],
      ['Dictionary', 'Key-value mapping.'],
    ],
    concepts: [
      'Use list for ordered items that can change.',
      'Use tuple for fixed grouped values.',
      'Use set for uniqueness and fast membership checks.',
      'Use dict for lookup by key.',
      'Loop with enumerate() for index and value.',
      'Loop over dict.items() for key and value.',
    ],
    exampleTitle: 'Collection choices',
    exampleCode: `users = ["Asha", "Rahul", "Asha"]
unique_users = set(users)

profile = {
    "name": "Asha",
    "role": "Backend Developer",
}

for key, value in profile.items():
    print(key, value)`,
    interview: [
      {
        q: 'List vs tuple?',
        a: 'A list is mutable and used for changing sequences. A tuple is immutable and used for fixed grouped data.',
      },
      {
        q: 'When should you use a dictionary?',
        a: 'Use a dictionary when data should be accessed by named keys instead of numeric positions.',
      },
    ],
  },
  {
    id: 'control-flow',
    level: 'Basic',
    title: 'Conditions, Loops, Match Case',
    goal: 'Control which code runs and how repetition works.',
    terms: [
      ['if/elif/else', 'Conditional branching.'],
      ['for loop', 'Iterates over an iterable.'],
      ['while loop', 'Runs while a condition is true.'],
      ['match case', 'Pattern matching syntax for branching on structure or value.'],
    ],
    concepts: [
      'Use if/elif/else for branches.',
      'Use for item in iterable for most loops.',
      'Use range() for numeric loops.',
      'Use break to stop and continue to skip one iteration.',
      'Use match case when it makes branching clearer.',
    ],
    exampleTitle: 'Loop and match case',
    exampleCode: `status = "active"

match status:
    case "active":
        label = "Can login"
    case "blocked":
        label = "Access denied"
    case _:
        label = "Unknown"

for number in range(1, 4):
    print(number, label)`,
    interview: [
      {
        q: 'for loop vs while loop?',
        a: 'Use for when iterating over a known iterable. Use while when repetition depends on a condition.',
      },
      {
        q: 'What is the purpose of break?',
        a: 'break exits the nearest loop immediately.',
      },
    ],
  },
  {
    id: 'functions-scope',
    level: 'Basic',
    title: 'Functions, Parameters, Scope',
    goal: 'Organize reusable logic with clean inputs and outputs.',
    terms: [
      ['Function', 'A reusable block of code.'],
      ['Parameter', 'A variable listed in a function definition.'],
      ['Argument', 'The actual value passed to a function.'],
      ['Scope', 'The area where a name can be accessed.'],
    ],
    concepts: [
      'Use return to send a value back.',
      'Use default arguments for optional values.',
      'Use *args for extra positional arguments.',
      'Use **kwargs for extra keyword arguments.',
      'Avoid mutable default arguments like items=[].',
      'Keep functions small and focused.',
    ],
    exampleTitle: 'Arguments and safe defaults',
    exampleCode: `def add_tag(name, tags=None):
    tags = [] if tags is None else tags
    tags.append(name)
    return tags


print(add_tag("python"))
print(add_tag("django"))`,
    interview: [
      {
        q: 'Why are mutable default arguments dangerous?',
        a: 'They are created once when the function is defined, so later calls can share the same object unexpectedly.',
      },
      {
        q: 'What is the difference between *args and **kwargs?',
        a: '*args captures extra positional arguments as a tuple. **kwargs captures extra keyword arguments as a dict.',
      },
    ],
  },
  {
    id: 'modules-packages',
    level: 'Intermediate',
    title: 'Modules, Packages, pip, Imports',
    goal: 'Split code into files and use third-party packages correctly.',
    terms: [
      ['Module', 'One Python file that can be imported.'],
      ['Package', 'A folder of modules, usually with __init__.py.'],
      ['pip', 'Python package installer.'],
      ['requirements.txt', 'A list of project dependencies.'],
    ],
    concepts: [
      'Use import module or from module import name.',
      'Avoid circular imports by separating shared logic.',
      'Install packages inside the virtual environment.',
      'Freeze dependencies with pip freeze > requirements.txt.',
      'Keep project code grouped by responsibility.',
    ],
    exampleTitle: 'Importing project code',
    exampleCode: `# math_tools.py
def add(left, right):
    return left + right


# app.py
from math_tools import add

print(add(2, 3))`,
    interview: [
      {
        q: 'What is a module in Python?',
        a: 'A module is a Python file that contains code and can be imported by other Python code.',
      },
      {
        q: 'What is a circular import?',
        a: 'It happens when two modules import each other during loading, often causing partially initialized modules.',
      },
    ],
  },
  {
    id: 'files-errors',
    level: 'Intermediate',
    title: 'Files, Exceptions, Context Managers',
    goal: 'Handle files and failures without leaking resources.',
    terms: [
      ['Exception', 'An error object raised during execution.'],
      ['try/except', 'Syntax for catching and handling exceptions.'],
      ['finally', 'Block that runs whether an exception happened or not.'],
      ['Context manager', 'Object used with with to handle setup and cleanup.'],
    ],
    concepts: [
      'Open files with with open(...) as file.',
      'Catch specific exceptions instead of bare except.',
      'Use else when code should run only if no exception happened.',
      'Use finally for cleanup.',
      'Raise custom exceptions for domain-specific errors.',
    ],
    exampleTitle: 'Safe file read',
    exampleCode: `from pathlib import Path

path = Path("notes.txt")

try:
    with path.open("r", encoding="utf-8") as file:
        content = file.read()
except FileNotFoundError:
    content = ""

print(content)`,
    interview: [
      {
        q: 'Why use with when opening files?',
        a: 'with closes the file automatically, even if an exception happens.',
      },
      {
        q: 'Why avoid bare except?',
        a: 'It can hide programming bugs and system-exit errors that should not be swallowed.',
      },
    ],
  },
  {
    id: 'comprehensions-iterators',
    level: 'Intermediate',
    title: 'Comprehensions, Iterators, Generators',
    goal: 'Write compact data transformations and lazy iteration.',
    terms: [
      ['Comprehension', 'Compact syntax for building lists, dicts, or sets.'],
      ['Iterable', 'Object that can be looped over.'],
      ['Iterator', 'Object that returns values one at a time with next().'],
      ['Generator', 'Lazy iterator created with yield or generator expression.'],
    ],
    concepts: [
      'Use list comprehension for clear transformations.',
      'Use dict and set comprehensions for mappings and unique values.',
      'Use generator expressions for large data streams.',
      'Use yield to produce values lazily.',
      'Avoid over-complex comprehensions; readability still matters.',
    ],
    exampleTitle: 'Generator function',
    exampleCode: `def active_names(users):
    for user in users:
        if user["active"]:
            yield user["name"]


users = [
    {"name": "Asha", "active": True},
    {"name": "Rahul", "active": False},
]

print(list(active_names(users)))`,
    interview: [
      {
        q: 'What is the benefit of a generator?',
        a: 'It produces values lazily, so it can save memory for large sequences.',
      },
      {
        q: 'List comprehension vs generator expression?',
        a: 'A list comprehension builds a full list immediately. A generator expression yields values one at a time.',
      },
    ],
  },
  {
    id: 'decorators-lambda',
    level: 'Intermediate',
    title: 'Decorators, Lambda, Higher Order Functions',
    goal: 'Treat functions as values and extend behavior cleanly.',
    terms: [
      ['First-class function', 'A function that can be passed around like any other value.'],
      ['Decorator', 'A function that wraps another function.'],
      ['Lambda', 'Small anonymous function expression.'],
      ['Closure', 'A function that remembers variables from its outer scope.'],
    ],
    concepts: [
      'Pass functions as arguments to reuse behavior.',
      'Use decorators for logging, timing, authentication, and caching.',
      'Use functools.wraps in decorators to preserve metadata.',
      'Use lambda only for simple one-expression functions.',
      'Understand map, filter, sorted(key=...), and callbacks.',
    ],
    exampleTitle: 'Simple decorator',
    exampleCode: `from functools import wraps


def trace(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"calling {func.__name__}")
        return func(*args, **kwargs)

    return wrapper


@trace
def add(left, right):
    return left + right`,
    interview: [
      {
        q: 'What is a decorator?',
        a: 'A decorator is a function that takes another function and returns a wrapped function with added behavior.',
      },
      {
        q: 'Why use functools.wraps?',
        a: 'It preserves the wrapped function name, docstring, and metadata.',
      },
    ],
  },
  {
    id: 'advanced-python',
    level: 'Advanced',
    title: 'Typing, Dataclasses, Async, Concurrency',
    goal: 'Use modern Python tools for larger applications.',
    terms: [
      ['Type hint', 'Annotation that documents expected value types.'],
      ['Dataclass', 'Class helper for storing structured data.'],
      ['async/await', 'Syntax for cooperative asynchronous code.'],
      ['Concurrency', 'Doing multiple tasks in overlapping time.'],
    ],
    concepts: [
      'Use type hints for readability and editor support.',
      'Use dataclasses for simple data containers.',
      'Use async for IO-bound operations with async libraries.',
      'Use threading for IO-bound blocking work.',
      'Use multiprocessing for CPU-bound work.',
      'Know that the GIL affects CPU-bound Python threads.',
    ],
    exampleTitle: 'Dataclass with type hints',
    exampleCode: `from dataclasses import dataclass


@dataclass
class Course:
    title: str
    lessons: int
    published: bool = False


python = Course(title="Python", lessons=24)
print(python.title)`,
    interview: [
      {
        q: 'What are type hints used for?',
        a: 'They document expected types and help editors, linters, and type checkers find mistakes earlier.',
      },
      {
        q: 'What is async useful for?',
        a: 'async is useful for IO-bound work such as network calls, database drivers, and many concurrent waiting tasks.',
      },
    ],
  },
]

export const pythonOopTopics = [
  {
    id: 'classes-objects',
    title: 'Classes, Objects, self, __init__',
    summary: 'A class is a blueprint. An object is an instance created from that blueprint.',
    bullets: [
      'Use class Name: to define a class.',
      '__init__ initializes instance state.',
      'self refers to the current object.',
      'Instance attributes belong to each object.',
      'Class attributes are shared through the class.',
    ],
    code: `class Account:
    bank_name = "Demo Bank"

    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount


account = Account("Asha", 500)
account.deposit(250)
print(account.balance)`,
  },
  {
    id: 'encapsulation',
    title: 'Encapsulation, Properties, Validation',
    summary: 'Encapsulation keeps data changes controlled through methods or properties.',
    bullets: [
      'Python uses convention more than strict privacy.',
      '_name means internal use by convention.',
      '__name triggers name mangling.',
      '@property exposes method logic as attribute access.',
      'Setters can validate before changing state.',
    ],
    code: `class Product:
    def __init__(self, price):
        self.price = price

    @property
    def price(self):
        return self._price

    @price.setter
    def price(self, value):
        if value < 0:
            raise ValueError("price cannot be negative")
        self._price = value`,
  },
  {
    id: 'inheritance',
    title: 'Inheritance and super()',
    summary: 'Inheritance lets one class reuse and specialize behavior from another class.',
    bullets: [
      'Child classes inherit parent attributes and methods.',
      'Override methods to customize behavior.',
      'Use super() to call parent behavior.',
      'Prefer composition when inheritance creates awkward relationships.',
      'Use isinstance() carefully for type checks.',
    ],
    code: `class User:
    def __init__(self, name):
        self.name = name

    def can_login(self):
        return True


class Admin(User):
    def __init__(self, name, permissions):
        super().__init__(name)
        self.permissions = permissions`,
  },
  {
    id: 'polymorphism',
    title: 'Polymorphism and Duck Typing',
    summary: 'Different objects can be used through the same expected behavior.',
    bullets: [
      'Python focuses on what an object can do, not only what class it is.',
      'If an object has the required method, it can participate.',
      'Polymorphism keeps code generic.',
      'Protocols and ABCs can document expected behavior.',
    ],
    code: `class EmailSender:
    def send(self, message):
        print(f"email: {message}")


class SmsSender:
    def send(self, message):
        print(f"sms: {message}")


def notify(sender, message):
    sender.send(message)`,
  },
  {
    id: 'abstraction',
    title: 'Abstraction, ABC, Interfaces',
    summary: 'Abstraction hides implementation details behind a clear contract.',
    bullets: [
      'Use abc.ABC for abstract base classes.',
      '@abstractmethod forces subclasses to implement methods.',
      'Abstract contracts are useful for plugins, services, and repositories.',
      'Keep abstractions small and meaningful.',
    ],
    code: `from abc import ABC, abstractmethod


class PaymentGateway(ABC):
    @abstractmethod
    def charge(self, amount):
        raise NotImplementedError


class StripeGateway(PaymentGateway):
    def charge(self, amount):
        return f"charged {amount}"`,
  },
  {
    id: 'dunder',
    title: 'Dunder Methods and Operator Overloading',
    summary: 'Dunder methods customize how objects behave with Python syntax.',
    bullets: [
      '__str__ controls user-friendly string output.',
      '__repr__ controls developer-focused output.',
      '__len__, __iter__, __eq__, __lt__ integrate with built-ins.',
      '__enter__ and __exit__ create context managers.',
      'Use dunder methods only when they make object behavior natural.',
    ],
    code: `class Cart:
    def __init__(self, items):
        self.items = items

    def __len__(self):
        return len(self.items)

    def __iter__(self):
        return iter(self.items)

    def __repr__(self):
        return f"Cart(items={self.items!r})"`,
  },
]

export const pythonAdvancedRows = [
  ['Memory model', 'Names reference objects. Assignment binds a name to an object; it does not copy by default.'],
  ['Shallow copy', 'Copies the outer container but keeps references to nested objects.'],
  ['Deep copy', 'Copies nested objects recursively with copy.deepcopy().'],
  ['Garbage collection', 'Python frees objects when references are gone, with cyclic GC for reference cycles.'],
  ['GIL', 'The Global Interpreter Lock allows only one Python bytecode thread at a time in CPython.'],
  ['Descriptors', 'Objects with __get__, __set__, or __delete__; properties are descriptor-based.'],
  ['Metaclasses', 'Classes that create classes. Powerful, but rarely needed in app code.'],
  ['Context managers', 'Objects that define __enter__ and __exit__ for with blocks.'],
  ['Packaging', 'Use pyproject.toml for modern package configuration.'],
  ['Testing', 'Use unittest or pytest to verify behavior and edge cases.'],
]

export const pythonGlossary = [
  ['PEP 8', 'The common Python style guide.'],
  ['REPL', 'Interactive Python shell.'],
  ['venv', 'Built-in virtual environment module.'],
  ['pip', 'Python package installer.'],
  ['None', 'Python value representing no value.'],
  ['Truthy/Falsy', 'How values behave in boolean checks.'],
  ['Iterable', 'Object usable in a for loop.'],
  ['Decorator', 'Function wrapper syntax using @name.'],
  ['Generator', 'Lazy iterator using yield.'],
  ['OOP', 'Object-oriented programming using classes and objects.'],
  ['MRO', 'Method Resolution Order used in inheritance lookup.'],
  ['ABC', 'Abstract Base Class for contracts.'],
  ['dataclass', 'Decorator for simple data-holder classes.'],
  ['asyncio', 'Python standard library for async IO.'],
]

export const pythonInterviewQuestions = [
  {
    q: 'What are the pillars of OOP in Python?',
    a: 'Encapsulation, inheritance, polymorphism, and abstraction. Python supports them with classes, methods, properties, inheritance, duck typing, ABCs, and protocols.',
  },
  {
    q: 'What is self?',
    a: 'self is the conventional name for the current object passed to instance methods.',
  },
  {
    q: 'Class variable vs instance variable?',
    a: 'A class variable is shared through the class. An instance variable belongs to one object.',
  },
  {
    q: 'What is Method Resolution Order?',
    a: 'MRO is the order Python follows when looking for methods in inheritance, especially multiple inheritance.',
  },
  {
    q: 'What is duck typing?',
    a: 'Duck typing means code depends on an object having the needed behavior, not on the object being a specific class.',
  },
  {
    q: 'What is a Python decorator?',
    a: 'A decorator wraps a function or class to add behavior without changing the original call site.',
  },
  {
    q: 'What is the difference between is and ==?',
    a: 'is checks identity, meaning same object. == checks value equality.',
  },
  {
    q: 'What is a generator?',
    a: 'A generator is a lazy iterator that yields values one at a time instead of building a full collection.',
  },
  {
    q: 'What is the GIL?',
    a: 'In CPython, the Global Interpreter Lock allows only one thread to execute Python bytecode at a time.',
  },
  {
    q: 'How do you handle exceptions properly?',
    a: 'Catch specific exception classes, keep try blocks small, use finally or with for cleanup, and raise clear errors when needed.',
  },
]
