from django.apps import AppConfig


class PredictionsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'django_app.apps.predictions'
    label = 'predictions'
    verbose_name = 'Prediction History'
