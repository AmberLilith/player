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

## 🔋 Reprodução em segundo plano (Android)

Se você instalar o app no Android (via "Adicionar à tela inicial") e a música pausar sozinha depois de alguns minutos com a tela minimizada, isso geralmente não é um bug do app — é o gerenciador de bateria do sistema suspendendo o processo em segundo plano.

Em aparelhos Samsung (One UI), isso acontece mesmo com o "Modo economia de bateria" desligado, porque existe uma lista separada de controle por app:

1. Vá em **Configurações > Cuidados com o dispositivo e bateria > Bateria > Limites de uso em segundo plano**.
2. Verifique se o **Player** está nas listas **Apps dormindo** ou **Apps em hibernação profunda** — se estiver, remova.
3. Adicione o Player na lista **Apps nunca em espera**.
4. Em **Configurações > Apps > Player > Bateria**, confirme que está como **Sem restrições**.

Em outros fabricantes (Xiaomi/MIUI, Huawei, OnePlus, etc.) o caminho é parecido: procure por configurações de bateria específicas do app e marque como "sem restrições" ou "irrestrito".

> Essa configuração é por aparelho — se reinstalar o app ou trocar de celular, pode ser necessário repetir esses passos.




