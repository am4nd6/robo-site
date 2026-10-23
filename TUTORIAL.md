# Tutorial: executar o NEXUS ROBOTICS pelo terminal

Este projeto é um site estático. Para executá-lo, instale o Node.js e use o `npx serve` na pasta raiz.

## 1. Abrir a pasta do projeto

No PowerShell ou Terminal:

```powershell
cd "C:\caminho\para\robo-site"
```

No macOS/Linux:

```bash
cd /caminho/para/robo-site
```

## 2. Iniciar o servidor com npx

```bash
npx serve .
```

## 3. Abrir no navegador

Use o endereço mostrado no terminal, geralmente:

```text
http://localhost:3000
```

## 4. Usar o site

- Role a página para controlar a apresentação principal.
- Use o menu superior ou os indicadores laterais para trocar de seção.
- Arraste o robô no configurador para girá-lo.
- Escolha o modelo e o componente para alterar a visualização.
- Use o controle de zoom para aproximar ou afastar a câmera.

## 5. Encerrar

Volte ao terminal onde o servidor está rodando e pressione:

```text
Ctrl+C
```

## Observação importante

Não abra `index.html` com duplo clique. O navegador usará o protocolo `file://`, que pode impedir o carregamento dos arquivos `.glb`. Sempre use um servidor local.
