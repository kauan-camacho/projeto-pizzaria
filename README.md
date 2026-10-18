# Lumina Pizza

Site estático responsivo com identidade italiana em verde, branco e vermelho. Abra `index.html` ou sirva a pasta com um servidor estático.

## Páginas

- `index.html`: apresentação e acesso rápido ao cardápio.
- `cardapio.html`: sabores, busca, filtros e pedido.
- `sobre.html`: apresentação breve da Lumina e sua proposta.
- `contato.html`: endereço, horários, Google Maps, atendimento e dúvidas frequentes.

O menu hambúrguer no celular abre uma janela nativa com foco contido, fechamento pelo botão ou Escape e indicação da página atual. O carrinho é compartilhado pelas páginas via localStorage.

## Dados reais da pizzaria

Edite `assents/JS/config.js`:

- `whatsapp`: DDI + DDD + número oficial, somente dígitos.
- `deliveryFee`: taxa fixa em reais; `0` para grátis ou `null` para confirmar.
- `address`: endereço completo com cidade e estado. Preencher este campo ativa os botões de localização e rota no Google Maps.
- `hours`: horários reais de atendimento.
- `bio`: biografia real. Vazio mantém uma apresentação da proposta, sem inventar fundação ou proprietários.
- `deliveryArea`: bairros atendidos e informações de entrega.

Sem WhatsApp configurado, o envio fica bloqueado para evitar um destinatário incorreto. Sem endereço, os links do Maps ficam ocultos. Os links seguem o formato universal documentado em https://developers.google.com/maps/documentation/urls/get-started e não precisam de chave de API.

O checkout prepara uma mensagem com sabores, quantidades, valores, recebimento, nome, pagamento e observações. O cliente toca em Enviar dentro do WhatsApp e a pizzaria confirma o pedido. Não há cobrança online ou confirmação automática.

Os quatro sabores e preços originais foram preservados e foram adicionados seis sabores com preços demonstrativos, totalizando dez opções. Fotos ilustrativas do Unsplash precisam de conexão; existe uma ilustração local de alternativa. As fontes são do sistema. Revise fotos, ingredientes, preços e dados comerciais antes do uso público.

## Verificação

Execute `node --check assents/JS/app.js`, `node --check assents/JS/site.js`, `node tests/checkout.cjs` e `node tests/site.cjs`.

Os testes verificam a lógica com um DOM simulado e a estrutura dos arquivos. A aparência, o toque em aparelhos reais e a abertura dos aplicativos ainda precisam ser revisados em navegador.

Os arquivos antigos de CSS e JS foram preservados, mas não são carregados.

WhatsApp de teste configurado: +55 (19) 99490-6750. O site prepara a mensagem; o cliente confirma o envio dentro do WhatsApp.
