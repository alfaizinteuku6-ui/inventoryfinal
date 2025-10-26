$projectRoot = "C:\Users\puneethreddy\OneDrive\Documents\django\sale-inventory"
Set-Location $projectRoot
Start-Process cmd -ArgumentList "/c cd /d `"$projectRoot\backend`" && venv\Scripts\activate && celery -A config worker -l info --pool=solo" -WindowStyle Hidden
