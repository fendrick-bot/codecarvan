# Transformers.js Setup for React Native/Expo

## Important Note ⚠️

**Transformers.js (`@xenova/transformers`) is primarily designed for web and Node.js environments.** While it can work in React Native, it has limitations:

1. **Performance**: May be slower than native solutions
2. **Compatibility**: Some features may not work in React Native
3. **Model Format**: Works best with ONNX models, not Keras `.h5` files

## Better Alternatives for React Native

### Option 1: ONNX Runtime (Recommended for React Native)
- Better performance in React Native
- Native bindings available
- Requires converting model to ONNX format

### Option 2: TensorFlow.js (Current Setup)
- Already configured in your project
- Works with converted TensorFlow.js models
- Good React Native support

## If You Still Want to Use Transformers.js

### Step 1: Install Dependencies

```bash
cd frontend
npm install @xenova/transformers
```

### Step 2: Update Model Service

I've created `modelServiceTransformers.ts` that uses Transformers.js. However, you'll need to:

1. **Convert your model to ONNX format** (Transformers.js works better with ONNX)
2. **Or use a Hugging Face model ID** (downloads from Hugging Face)

### Step 3: Model Conversion to ONNX

To use your local Gemma model with Transformers.js, convert it to ONNX:

```python
# Install ONNX conversion tools
pip install onnx onnxruntime

# Convert Keras model to ONNX
# (You'll need a conversion script)
```

### Step 4: Use the Service

```typescript
import { modelServiceTransformers } from './services/modelServiceTransformers';

// Load model
await modelServiceTransformers.loadModel('google/gemma-2b-it');

// Generate text
const result = await modelServiceTransformers.generate('Your prompt here', {
  maxLength: 100,
  temperature: 0.7
});
```

## Recommended Approach

For React Native, I recommend:

1. **Keep using TensorFlow.js** (already set up)
   - Convert `.h5` to TensorFlow.js format
   - Works well in React Native
   - Good performance

2. **Or switch to ONNX Runtime**
   - Convert `.h5` to ONNX format
   - Use `onnxruntime-react-native`
   - Better native performance

## Model Format Comparison

| Format | React Native Support | Performance | Setup Complexity |
|--------|---------------------|-------------|------------------|
| TensorFlow.js | ✅ Excellent | Good | Medium |
| ONNX | ✅ Excellent | Excellent | Medium |
| Transformers.js | ⚠️ Limited | Moderate | Easy (but limited) |
| Keras `.h5` | ❌ None | N/A | N/A |

## Conclusion

**For your use case (React Native + Expo), I recommend:**
- **TensorFlow.js** (current setup) - Already configured, just needs model conversion
- **ONNX Runtime** - Better performance, requires ONNX conversion

Transformers.js is better suited for web applications, not React Native.

