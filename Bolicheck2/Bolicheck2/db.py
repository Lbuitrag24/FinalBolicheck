from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SQLITE = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": "bolicheck",
    }
}

MYSQL = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'bolicheck2',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': 'localhost', 
        'PORT': '3306',
        'OPTIONS': {'init_command': "SET sql_mode='STRICT_TRANS_TABLES'"},
    }
}

POSTGRESQL = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'bolicheck2',
        'USER': 'postgres',
        'PASSWORD': '1234',
        'HOST': 'localhost', 
        'PORT': '5432',
    }
}