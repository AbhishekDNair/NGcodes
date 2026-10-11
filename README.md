# 🌾 Karshaka Care

**An agricultural assistant built for Kerala's farmers.**

Karshaka Care is a project focused on helping paddy farmers make better farming decisions through crop disease detection, weather updates, farming recommendations and disaster alerts. It is designed with farmers in Kuttanad, Alappuzha, in mind, where flooding and changing weather conditions can have a major impact on rice cultivation.

The goal is to bring useful farming tools together in one place, with Malayalam support and offline functionality wherever possible.

## What does it do?

* **🌿 Paddy Leaf Disease Detection** — Uses a MobileNetV2 image classification model to identify supported paddy leaf conditions from an uploaded image.
* **🌱 Farming Recommendations** — Uses a rule-based engine and agricultural guidance to provide relevant suggestions.
* **🌦️ Weather Information** — Helps farmers check weather conditions before planning farm activities.
* **🌊 Disaster Radar** — Provides disaster-related information and safety guidance, particularly for flood-prone farming areas.
* **📅 Farm Planner** — Helps organize farming activities and plan upcoming tasks.
* **📝 FarmLog** — Keeps records of farm activities and observations.
* **🏛️ Government Scheme Assistance** — Helps farmers understand eligibility and prepare scheme applications, with human review for important actions.
* **🗣️ Malayalam Support** — Makes the application more accessible to local farmers.
* **📴 Offline Support** — Supports selected features without an internet connection.

## How does disease detection work?

The disease detection feature uses a lightweight deep-learning model to classify paddy leaf images.

1. The farmer uploads an image of a paddy leaf.
2. The image is resized and preprocessed for the model.
3. MobileNetV2 analyzes the image and predicts a class.
4. ONNX Runtime executes the exported model locally.
5. The result is checked against the application's confidence policy before further recommendations are provided.

The supported classes are:

* Brown Spot
* Bacterial Leaf Blight
* Rice Leaf Blast
* Healthy Paddy

The model's prediction is not a guarantee of a correct diagnosis. Image quality, lighting and similarities between symptoms can affect the result.

## Technologies Used

| Technology                   | Purpose                                        |
| ---------------------------- | ---------------------------------------------- |
| MobileNetV2                  | Paddy leaf image classification                |
| ONNX Runtime                 | Local model inference                          |
| Progressive Web App (PWA)    | App-like web experience                        |
| Service Worker               | Caching and offline support                    |
| SQLite                       | Local data storage                             |
| MCP (Model Context Protocol) | Connecting the application to tools            |
| Playwright                   | Browser automation for supported workflows     |
| Rule-based engine            | Agricultural recommendations and safety checks |

## Why Karshaka Care?

Many farming tools depend on a stable internet connection or focus on just one problem. Karshaka Care aims to combine disease detection, farming records, weather information and disaster awareness in a single application.

The project also focuses on local needs, especially the challenges faced by paddy farmers in Kuttanad. Offline-capable features and Malayalam support are important parts of that approach.

## Running the Project

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

Install dependencies and start the application using the instructions for the framework and package manager used in this repository.

**Note:** Setup commands, environment variables and model files depend on the actual project configuration. Refer to the relevant configuration files before running the application.

## Current Scope

Karshaka Care is designed to assist farmers with information and decision-making. Its predictions and recommendations should be treated as guidance rather than a replacement for agricultural experts or official emergency instructions.

Features that depend on external services may require an internet connection. Offline availability also depends on which resources and data have already been cached.

## Future Improvements

* Improve disease detection using more real-world paddy leaf images.
* Validate recommendations with agricultural experts.
* Improve offline data handling and synchronization.
* Expand support for Malayalam voice interaction.
* Improve integration with reliable weather and disaster information sources.
* Test the application with farmers in real farming conditions.

## Contributing

Suggestions, bug reports and improvements are welcome. If you find an issue or have an idea that could make the application more useful for farmers, feel free to open an issue or submit a pull request.

---

**Karshaka Care — technology for more informed farming decisions.**
