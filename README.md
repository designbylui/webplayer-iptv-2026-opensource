# WEBPLAYER - Xtream grátis - Static Version

Versão simplificada e estática do ZzBox Player para deploy no GitHub Pages.

## Funcionalidades

- ✅ Login Xtream Codes
- ✅ TV ao Vivo
- ✅ Filmes
- ✅ Séries com temporadas e episódios
- ✅ Player HLS para streams live
- ✅ Player MP4/MKV para VOD
- ✅ Interface responsiva
- ✅ Busca de conteúdo
- ✅ Persistência de sessão

## Deploy no GitHub Pages

### Opção 1: Via Interface do GitHub

1. Faça push do código para seu repositório GitHub
2. Vá em **Settings** > **Pages**
3. Em "Source", selecione **Deploy from a branch**
4. Selecione a branch `main` e a pasta `/docs`
5. Clique em **Save**

### Opção 2: Via GitHub Actions (Automático)

1. Crie o arquivo `.github/workflows/deploy.yml` com o conteúdo de deploy
2. Faça push e o deploy será automático

## Uso Local

Abra `docs/index.html` diretamente no navegador ou use um servidor local:

```bash
cd docs
npx serve .
```

## Estrutura

```
docs/
├── index.html    # Página principal
├── style.css     # Estilos
├── app.js        # Lógica da aplicação
└── logo.png      # Logo
```

## Limitações

- Alguns servidores Xtream Codes podem bloquear requisições CORS
- Nesse caso, o player pode não funcionar diretamente do navegador
- Para contornar isso, você pode usar uma extensão de CORS ou um proxy

