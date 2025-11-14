@echo off
REM Quick script to convert Gemma3 model to TensorFlow.js format for mobile (Windows)

echo ==========================================
echo Converting Gemma3 Model to TensorFlow.js
echo ==========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed. Please install Python 3.8+ first.
    exit /b 1
)

REM Navigate to model directory
cd gemma3_instruct270m

REM Install dependencies
echo Step 1: Installing Python dependencies...
pip install tensorflowjs tensorflow keras-hub -q

REM Create output directory
echo.
echo Step 2: Creating output directory...
if not exist "..\frontend\assets\models\gemma3" mkdir "..\frontend\assets\models\gemma3"

REM Convert model
echo.
echo Step 3: Converting model to TensorFlow.js format...
echo This may take a few minutes...
python convert_to_tfjs.py --output-path ..\frontend\assets\models\gemma3 --quantization float16

echo.
echo ==========================================
echo Conversion complete!
echo Model saved to: frontend\assets\models\gemma3\
echo ==========================================
pause

