# fullstack-jotanunes
Branch :ndocker

no início precisamos ativar o venv

(TUDO A BAIXO PRECISA SER DIGITADO NO TERMINAL)

python -m venv venv

.\venv\Scripts\Activate.ps1

se der erro:

venv\Scripts\activate.bat

ou:

source venv/Scripts/activate

e caso de linux ou macOS:

source venv/bin/activate


no mesmo nível do manage.py(arquivo do backend), rodar:

(para chegar no nível do manage.py, digitamos cd backend e depois, cd backend-jotanunes

python manage.py migrate

python manage.py createsuperuser

python manage.py runserver

teremos http://127.0.0.1:8000/

http://127.0.0.1:8000/admin

http://127.0.0.1:8000/api/*                 * = urls, por exemplo http://127.0.0.1:8000/api/obras

no frontend iremos rodar npm install

npm start
