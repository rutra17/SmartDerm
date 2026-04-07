from pathlib import Path
from src.preprocessing import preprocess_image, get_device


def main():

    
    device = get_device()
    print(f"[smartderm] Dispositivo: {device}")

    
    project_root = Path(__file__).resolve().parent.parent

    # Caminho da imagem que vamos usar
    image_path = project_root / "data" / "sample_images" / "exemplo.jpg"

    try:
        # Chama a função que prepara a imagem
        img = preprocess_image(image_path, device)

        
        print("[smartderm] Pré-processamento concluído.")

        
        print(f"Shape: {img.shape}")

    except Exception as e:
        
        print("[smartderm] Erro:")
        print(e)



if __name__ == "__main__":
    main()