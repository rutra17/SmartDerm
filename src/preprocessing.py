from pathlib import Path
import torch
from PIL import Image
from torchvision import transforms


def get_transforms():
    
    
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            [0.485, 0.456, 0.406],
            [0.229, 0.224, 0.225]
        )
    ])


def preprocess_image(image_path, device="cpu"):
    
    image_path = Path(image_path)

    if not image_path.exists():
        raise FileNotFoundError(f"Imagem não encontrada: {image_path}")

    image = Image.open(image_path).convert("RGB")
    transform = get_transforms()
    image_tensor = transform(image)

    # Adiciona a dimensão de batch
    image_tensor = image_tensor.unsqueeze(0)

    return image_tensor.to(device)


def get_device():
    
    return "cuda" if torch.cuda.is_available() else "cpu"