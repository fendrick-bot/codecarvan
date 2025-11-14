#!/bin/bash
# Quick script to convert Gemma3 model to TensorFlow.js format for mobile

echo "=========================================="
echo "Converting Gemma3 Model to TensorFlow.js"
echo "=========================================="
echo ""

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "Error: Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Navigate to model directory
cd gemma3_instruct270m

# Install dependencies
echo "Step 1: Installing Python dependencies..."
pip install tensorflowjs tensorflow keras-hub -q

# Create output directory
echo ""
echo "Step 2: Creating output directory..."
mkdir -p ../frontend/assets/models/gemma3

# Convert model
echo ""
echo "Step 3: Converting model to TensorFlow.js format..."
echo "This may take a few minutes..."
python convert_to_tfjs.py --output-path ../frontend/assets/models/gemma3 --quantization float16

echo ""
echo "=========================================="
echo "Conversion complete!"
echo "Model saved to: frontend/assets/models/gemma3/"
echo "=========================================="

