# My Personal Media Player (PWA)
Um player de mídia moderno, focado em privacidade e performance, que funciona totalmente offline. Este projeto foi desenvolvido para permitir que o usuário gerencie sua própria biblioteca de músicas e vídeos sem depender de serviços de nuvem, armazenando tudo localmente no navegador.

## 🚀 Funcionalidades
Instalação PWA: Transforme o site em um aplicativo nativo no Windows, Android ou iOS.

### Armazenamento Local (IndexedDB)
 Os arquivos de mídia (MP3, MP4, etc.) são salvos no banco de dados do navegador, garantindo que não precisem ser baixados novamente.

### Modo Offline
 Ouça suas músicas e veja seus vídeos mesmo sem conexão com a internet.

### Persistência de Estado
O app lembra exatamente onde você parou na última música ou vídeo.

### Interface Premium Dark
Design sofisticado em tons de Preto, Dourado e Azul Neon.

### Gerenciamento de Playlists
Opções para "Abrir Pasta" (limpa o banco) ou "Adicionar à Playlist" existente.

## 🛠️ Tecnologias Utilizadas

### React + TypeScript
Interface reativa e tipagem estática para maior segurança.

### Vite
Tooling ultra-rápido para desenvolvimento e build.

### IndexedDB (Dexie.js)
Gerenciamento de armazenamento binário no cliente.

### Service Workers
Cache de ativos e suporte a Progressive Web App.

### React Router
Navegação entre as áreas de Música e Vídeo.

## 📦 Como rodar o projeto

### Clone o repositório:
```Bash
git clone https://github.com/AmberLilith/player.git
cd player
```
### Instale as dependências:
```Bash
npm install
```

### Rode em modo de desenvolvimento:
```Bash
npm run dev
```

### Para testar a experiência PWA simulando ambiente produtivo

```Bash
npm run build
npx serve -s dist
```

Será exido algo como abaixo:
<div style="padding: 20px;background-color:#333a31;border: 1px solid #23b307;width: 400px;">
    <div style="color:#23b307">Serving! </div></br>          
    <div style="font-weight: bold;"> - Local:    http://localhost:3000  </div>      
    <div style="font-weight: bold;">  - Network:  http://192.168.100.33:3000 </div>                                              
     <div style="color:#adb2ac;text-align: center;">Copied local address to clipboard!</div>
</div></br>



    Onde:
    - Local: http://localhost:3000 (acesso local)
    - On Your Network: http://192.168.100.33:3000 (acesso via rede local) podendo ser acessados por outros dispositivos na mesma rede usando o IP do computador.

## 📐 Arquitetura de Dados
Diferente de players comuns que usam apenas URLs temporárias, este projeto utiliza o IndexedDB para persistir arquivos binários (Blobs).

Isso permite que, ao fechar e abrir o navegador, o aplicativo recupere os arquivos do disco local instantaneamente, simulando o comportamento de um software desktop tradicional.

Dica para o seu GitHub:
Se quiser deixar o repositório ainda mais "matador", tire um print do player rodando (com o tema Dark e as músicas listadas) e coloque uma seção de "Screenshots" no começo do README.
  

