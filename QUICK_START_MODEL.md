# Quick Start: Run Gemma3 Model on Mobile Device

## Overview
To run the `.h5` model directly on your mobile device, you need to:
1. **Convert** the Keras model (`.h5`) to TensorFlow.js format (one-time step)
2. **Load** the converted model in your React Native app

## Step 1: Convert Model (One-Time Setup)

### Windows:
```bash
convert_model.bat
```

### Linux/Mac:
```bash
chmod +x convert_model.sh
./convert_model.sh
```

### Manual Conversion:
```bash
cd gemma3_instruct270m
pip install tensorflowjs tensorflow keras-hub
python convert_to_tfjs.py --output-path ../frontend/assets/models/gemma3 --quantization float16
```

**This will:**
- Convert your `model.weights.h5` to TensorFlow.js format
- Save it to `frontend/assets/models/gemma3/`
- Reduce model size by ~50% (using float16 quantization)

## Step 2: Verify Model Files

After conversion, check that these files exist:
```
frontend/assets/models/gemma3/
├── model.json          ← Model architecture
├── model.weights.bin   ← Model weights (or shards)
├── metadata.json      ← Model metadata
└── assets/
    └── tokenizer/
        └── vocabulary.spm
```

## Step 3: Use the Model in Your App

The model service is already set up! Just use the hook:

```typescript
import { useGemmaModel } from './hooks/useGemmaModel';

function MyComponent() {
  const { isLoaded, loadModel, generate } = useGemmaModel();

  useEffect(() => {
    loadModel(); // Load once on mount
  }, []);

  const handleGenerate = async () => {
    const response = await generate("Your prompt here", {
      maxLength: 100,
      temperature: 0.7
    });
    console.log(response);
  };

  return (
    <Button 
      onPress={handleGenerate} 
      disabled={!isLoaded}
      title="Generate"
    />
  );
}
```

## Step 4: Test

```bash
cd frontend
npm start
```

Then navigate to the Model screen in your app and test!

## Important Notes

1. **Model Size**: The converted model will be ~500MB (with float16 quantization)
2. **First Load**: Loading the model the first time may take 30-60 seconds
3. **Offline**: Once loaded, the model runs completely offline on the device
4. **No API Needed**: The model runs directly on the device - no backend required!

## Troubleshooting

**Model not found error?**
- Make sure you've converted the model (Step 1)
- Check that files exist in `frontend/assets/models/gemma3/`

**TensorFlow.js errors?**
- Clear Metro cache: `npm start -- --clear`
- Reinstall dependencies: `npm install`

**Model too large?**
- Use `--quantization uint8` for smaller size (~250MB)
- Note: This may slightly reduce quality

