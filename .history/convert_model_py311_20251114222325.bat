@echo off
REM Convert model using Python 3.11 (if installed)

echo ==========================================
echo Converting Gemma3 Model to TensorFlow.js
echo Using Python 3.11
echo ==========================================
echo.

REM Check if Python 3.11 is available
py -3.11 --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python 3.11 is not installed.
    echo.
    echo Please install Python 3.11 from:
    echo https://www.python.org/downloads/release/python-3110/
    echo.
    echo You can keep Python 3.12 installed - both can coexist.
    pause
    exit /b 1
)

echo Python 3.11 found!
echo.

REM Navigate to model directory
cd gemma3_instruct270m

REM Create virtual environment with Python 3.11
echo Step 1: Creating virtual environment with Python 3.11...
if not exist "venv_tfjs" (
    py -3.11 -m venv venv_tfjs
)

REM Activate virtual environment
echo Step 2: Activating virtual environment...
call venv_tfjs\Scripts\activate.bat

REM Install dependencies
echo Step 3: Installing Python dependencies...
pip install --upgrade pip
pip install tensorflowjs tensorflow keras-hub

REM Create output directory
echo.
echo Step 4: Creating output directory...
if not exist "..\frontend\assets\models\gemma3" mkdir "..\frontend\assets\models\gemma3"

REM Convert model
echo.
echo Step 5: Converting model to TensorFlow.js format...
echo This may take a few minutes...
python convert_to_tfjs.py --output-path ..\frontend\assets\models\gemma3 --quantization float16

echo.
echo ==========================================
echo Conversion complete!
echo Model saved to: frontend\assets\models\gemma3\
echo ==========================================
echo.
echo Note: The virtual environment is still active.
echo To deactivate, type: deactivate
pause

