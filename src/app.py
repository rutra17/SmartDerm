import streamlit as st
from PIL import Image

st.set_page_config(page_title="SmartDerm AI", layout="wide")

st.title("🩺 SmartDerm: Detecção Dermatológica Assistida")
st.markdown("---")

uploaded_file = st.file_uploader("Faça o upload da foto da lesão para análise", type=["jpg", "png", "jpeg"])

col1, col2 = st.columns(2)

if uploaded_file is not None:
    image = Image.open(uploaded_file)
    with col1:
        st.image(image, caption="Imagem Original", use_column_width=True)
    
    with col2:
        st.info("O laudo analisado por IA aparecerá aqui após o processamento.")
        # Placeholder para o agente LLM
        st.subheader("Laudo Sugerido pelo Agente:")
        st.write("Aguardando inferência do modelo...")

st.sidebar.header("Métricas do Sistema")
st.sidebar.metric("Recall Esperado", "92%")