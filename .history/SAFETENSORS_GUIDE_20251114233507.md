# Using .safetensors Files with Transformers.js/ONNX

## What are .safetensors Files?

`.safetensors` is a format used by Hugging Face to store model weights safely (without pickle security issues). However:

- ✅ Contains **model weights** only
- ❌ Does **NOT** contain model architecture
- ❌ Cannot run directly in React Native/JavaScript

## Do You Need Conversion?

**YES, you still need conversion** for React Native/Expo, but it's easier than with `.h5` files!

## Your Options

### Option 1: Use Hugging Face Model ID (Easiest) ✅

If your model is on Hugging Face, you can use it directly:

```typescript
import { pipeline } from '@xenova/transformers';

// Use the Hugging Face model ID
const generator = await pipeline(
  'text-generation',
  'google/gemma-2b-it', // Your model ID on Hugging Face
  {
    device: 'cpu',
    dtype: 'q8', // Quantized for smaller size
  }
);

const result = await generator('Your prompt', {
  max_new_tokens: 100,
  temperature: 0.7
});
```

**No conversion needed!** Transformers.js downloads and converts automatically.

### Option 2: Convert .safetensors to ONNX (Best for React Native) ✅

For better React Native performance, convert to ONNX:

```python
# Install conversion tools
pip install optimum[onnxruntime] transformers

# Convert using Optimum (Hugging Face's conversion tool)
from optimum.onnxruntime import ORTModelForCausalLM
from transformers import AutoTokenizer

# Load and convert
model = ORTModelForCausalLM.from_pretrained(
    'path/to/your/model',  # Directory with config.json and .safetensors
    export=True  # Converts to ONNX
)

# Save ONNX model
model.save_pretrained('./onnx_model')
```

Then use with ONNX Runtime in React Native (better performance).

### Option 3: Use Transformers.js with Local Model

If you have the full model directory (config.json + .safetensors):

```typescript
import { pipeline } from '@xenova/transformers';

// Point to local model directory
const generator = await pipeline(
  'text-generation',
  './assets/models/gemma3', // Local path with config.json and .safetensors
  {
    device: 'cpu',
    local_files_only: true
  }
);
```

**Note**: Transformers.js will convert to ONNX internally, but this may be slow.

## Recommended Approach for React Native

### Best: Convert to ONNX First

1. **Convert .safetensors → ONNX** (one-time, on your computer)
2. **Use ONNX Runtime** in React Native (best performance)

```bash
# Convert using Optimum
pip install optimum[onnxruntime] transformers

python convert_safetensors_to_onnx.py
```

Then use the ONNX model with `onnxruntime-react-native` (I already created `modelServiceONNX.ts` for you).

## What Files Do You Have?

To give you the exact steps, I need to know:

1. **Do you have:**
   - ✅ `model.safetensors` (weights)
   - ✅ `config.json` (model architecture)
   - ✅ `tokenizer.json` or tokenizer files

2. **Is your model on Hugging Face?**
   - If yes → Use model ID directly (easiest)
   - If no → Convert to ONNX

3. **What's the model name/ID?**
   - Example: `google/gemma-2b-it`

## Quick Answer

**For React Native/Expo:**

- ✅ **Easiest**: Use Hugging Face model ID with Transformers.js (no conversion)
- ✅ **Best Performance**: Convert to ONNX, use ONNX Runtime
- ⚠️ **Not Recommended**: Using .safetensors directly (needs conversion anyway)

**You still need conversion** (either automatic via Transformers.js or manual to ONNX), but `.safetensors` makes it easier than `.h5` files!

