# Setup Guide: Run Gemma3 Model Directly on Mobile

## Important Note
The `.h5` (Keras) model file **cannot run directly** in React Native/JavaScript. It must be converted to TensorFlow.js format first. This is a one-time conversion step.

## Step 1: Convert Model to TensorFlow.js Format

### 1.1 Install Python Dependencies
```bash
cd gemma3_instruct270m
pip install tensorflowjs tensorflow keras-hub
```

Or use the requirements file:
```bash
pip install -r requirements_tfjs.txt
```

### 1.2 Convert the Model
```bash
python convert_to_tfjs.py --output-path ../frontend/assets/models/gemma3 --quantization float16
```

**Options:**
- `--quantization float16` - Reduces model size by ~50% (recommended for mobile)
- `--quantization uint8` - Reduces model size by ~75% (smaller but may affect quality)
- No quantization - Full quality but larger file size

### 1.3 Verify Conversion
After conversion, check that these files exist:
```
frontend/assets/models/gemma3/
├── model.json
├── model.weights.bin (or multiple shards)
├── metadata.json
└── assets/
    └── tokenizer/
        └── vocabulary.spm
```

## Step 2: Update Model Service

The model service is already set up to load TensorFlow.js models. Just make sure:
1. The converted model is in `frontend/assets/models/gemma3/`
2. TensorFlow.js dependencies are installed (already done)

## Step 3: Test the Model

```bash
cd frontend
npm start
```

Then use the ModelScreen in your app to test the model.

## Model Size Reference
- Original `.h5`: ~1GB
- TensorFlow.js (no quantization): ~1GB
- TensorFlow.js (float16): ~500MB
- TensorFlow.js (uint8): ~250MB

