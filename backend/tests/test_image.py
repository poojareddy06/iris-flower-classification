import io
from PIL import Image, ImageDraw
from app.services.image_service import ImageService

def test_image_analyzer_valid_flower():
    # Synthetic flower image with purple petals and yellow center
    img = Image.new("RGB", (300, 300), color=(80, 140, 70))
    draw = ImageDraw.Draw(img)
    draw.ellipse([80, 80, 220, 220], fill=(120, 60, 190))
    draw.ellipse([130, 130, 170, 170], fill=(240, 210, 40))

    buf = io.BytesIO()
    img.save(buf, format="JPEG")

    res = ImageService.analyze_flower_image(buf.getvalue(), "iris_photo.jpg")
    assert res["is_suitable"] is True
    assert "Iris" in res["predicted_species"]
    assert res["confidence"] > 0.5
    assert "flower_info" in res
    assert "scientific_name" in res["flower_info"]
    assert "possible_disease" in res
    assert "disclaimer" in res["possible_disease"]
    # Check that disclaimer emphasizes non-medical nature
    assert "NOT" in res["possible_disease"]["disclaimer"] or "NOTICE" in res["possible_disease"]["disclaimer"]

def test_image_analyzer_blank_image():
    # Completely flat gray canvas
    img = Image.new("RGB", (200, 200), color=(128, 128, 128))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")

    res = ImageService.analyze_flower_image(buf.getvalue(), "blank.jpg")
    assert res["is_suitable"] is False
    assert "Unclear" in res["predicted_species"] or "Non-Flower" in res["predicted_species"]
