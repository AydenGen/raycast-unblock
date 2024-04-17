---
title: Function Call
---

# Function Call <sup>*`🌊 Alpha`*</sup>

> [!NOTE]
> Only supports OpenAI.

You can use the function call feature in AI Chat, which is currently in the `🌊 Alpha` stage.

> Due to time constraints, **Azure OpenAI** is not supported for the time being. Contributions are welcome.

## Usage

Now we support the following functions:

- `Serp` - Search Engine Results Page (Power by [ApyHub](https://apyhub.com/))
- `WebSearch` - Search for information from the internet

You can control the started plugins by yourself. This requires you to configure the plugins configuration item in `[AI.Functions]` in the configuration file. The usage method is detailed in the configuration example.

You can find the environment variables which are required to use features in the `config.example.toml` file.

## Configuration

- `[AI.Functions].disable`: Disable the function call feature.
- `[AI.Functions].plugins`: A set of function call tools that are available for use.
- `[AI.Functions].Serp`
  - `apyHub_api_key`: The API Key in apyHub

### Example

```toml
[AI.Functions]
disable = false
plugins = [
  'serp',
  'web_search'
]

[AI.Functions.Serp]
apyHub_api_key = ""
```
