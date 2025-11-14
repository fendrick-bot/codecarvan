# Running Gemma3 Model Offline in React Native

This guide explains how to set up and use the Gemma3 model for offline text generation in your React Native/Expo app.

## Quick Start

### Step 1: Convert Keras Model to TensorFlow.js

```bash
cd gemma3_instruct270m
pip install -r requirements_tfjs.txt
python convert_to_tfjs.py --output-path ../frontend/assets/models/gemma3 --quantization float16
```

### Step 2: Install Dependencies

```bash
cd frontend
npm install
```

### Step 3: Use the Model

```typescript
import { useGemmaModel } from './hooks/useGemmaModel';

function MyComponent() {
  const { isLoaded, loadModel, generate } = useGemmaModel();

  useEffect(() => {
    loadModel();
  }, []);

  const handleGenerate = async () => {
    const result = await generate("Explain machine learning");
    console.log(result);
  };

  return (
    <Button onPress={handleGenerate} disabled={!isLoaded} title="Generate" />
  );
}
```

## Files Created

1. **`frontend/services/modelService.ts`** - Service for loading and running the model
2. **`frontend/hooks/useGemmaModel.ts`** - React hook for easy model access
3. **`frontend/screens/ModelScreen.tsx`** - Example screen using the model
4. **`gemma3_instruct270m/convert_to_tfjs.py`** - Script to convert Keras model to TensorFlow.js
5. **`gemma3_instruct270m/SETUP_OFFLINE.md`** - Detailed setup instructions

## Dependencies Added

- `@tensorflow/tfjs` - Core TensorFlow.js
- `@tensorflow/tfjs-react-native` - React Native bindings
- `expo-asset` - Asset management
- `expo-file-system` - File system access

## Model Location

After conversion, the model should be at:
```
frontend/assets/models/gemma3/
├── model.json
├── model.weights.bin (or shards)
├── metadata.json
└── assets/tokenizer/vocabulary.spm
```

## Important Notes

1. **Tokenizer Implementation**: The tokenizer needs to be implemented. See `modelService.ts` for placeholders.
2. **Model Size**: The model is large (~250MB with quantization). Consider device memory limits.
3. **First Load**: Loading the model takes 30-60 seconds on first run.
4. **Performance**: Generation speed depends on device capabilities (typically 10-50 tokens/second).

## Troubleshooting

See `gemma3_instruct270m/SETUP_OFFLINE.md` for detailed troubleshooting guide.

## Example Screen

See `frontend/screens/ModelScreen.tsx` for a complete example of how to use the model in a React Native screen.

