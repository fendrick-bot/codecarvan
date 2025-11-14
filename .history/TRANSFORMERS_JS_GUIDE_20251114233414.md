# Using Transformers.js / ONNX in React Native/Expo

## Overview

You asked about using Transformers.js. Here's the reality:

### Transformers.js (`@xenova/transformers`)
- ✅ Great for **web** and **Node.js**
- ⚠️ **Limited support** for React Native
- Uses ONNX models under the hood

### Better Alternative: ONNX Runtime (Direct)
- ✅ **Excellent** React Native support
- ✅ Better performance
- ✅ Native bindings available
- ✅ What Transformers.js uses internally anyway

## Recommended Solution: ONNX Runtime

Since Transformers.js uses ONNX internally, let's use ONNX Runtime directly for better React Native support.

### Step 1: Install ONNX Runtime

```bash
cd frontend
npm install onnxruntime-react-native
```

### Step 2: Configure Expo

Update `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "onnxruntime-react-native",
        {
          "enableGPU": false
        }
      ]
    ]
  }
}
```

### Step 3: Convert Model to ONNX

You need to convert your `.h5` Keras model to ONNX format:

```python
# Install conversion tools
pip install onnx tf2onnx

# Convert Keras model to ONNX
import tensorflow as tf
import tf2onnx

# Load your Keras model
model = tf.keras.models.load_model('model.weights.h5')

# Convert to ONNX
onnx_model, _ = tf2onnx.convert.from_keras(model, opset=13)

# Save ONNX model
with open('model.onnx', 'wb') as f:
    f.write(onnx_model.SerializeToString())
```

### Step 4: Use the ONNX Service

I've created `modelServiceONNX.ts` for you. Update your hook:

```typescript
import { modelServiceONNX } from './services/modelServiceONNX';

// Load model
await modelServiceONNX.loadModel();

// Generate
const result = await modelServiceONNX.generate('Your prompt', {
  maxLength: 100,
  temperature: 0.7
});
```

## Alternative: Use Transformers.js (Limited)

If you still want to try Transformers.js:

### Install
```bash
npm install @xenova/transformers
```

### Use
```typescript
import { pipeline } from '@xenova/transformers';

const generator = await pipeline('text-generation', 'google/gemma-2b-it');
const result = await generator('Your prompt', { max_new_tokens: 100 });
```

**Note**: This may not work well in React Native. ONNX Runtime is recommended.

## Model Format Comparison

| Format | Library | React Native Support | Performance |
|--------|---------|---------------------|-------------|
| **ONNX** | `onnxruntime-react-native` | ✅ Excellent | ⚡ Excellent |
| **TensorFlow.js** | `@tensorflow/tfjs-react-native` | ✅ Excellent | ⚡ Good |
| **Transformers.js** | `@xenova/transformers` | ⚠️ Limited | 🐌 Moderate |

## My Recommendation

**For React Native/Expo, use one of these:**

1. **ONNX Runtime** (Best performance)
   - Convert `.h5` → ONNX
   - Use `onnxruntime-react-native`
   - Best native performance

2. **TensorFlow.js** (Already set up)
   - Convert `.h5` → TensorFlow.js
   - Use `@tensorflow/tfjs-react-native`
   - Good performance, already configured

3. **Transformers.js** (Not recommended for RN)
   - Limited React Native support
   - Better for web apps

## Quick Start: ONNX Runtime

1. **Install:**
   ```bash
   npm install onnxruntime-react-native
   ```

2. **Convert model:**
   ```python
   # Use the conversion script I'll create
   python convert_to_onnx.py
   ```

3. **Use the service:**
   ```typescript
   import { modelServiceONNX } from './services/modelServiceONNX';
   ```

Would you like me to:
1. Set up ONNX Runtime completely?
2. Create the ONNX conversion script?
3. Update your hooks to use ONNX?

