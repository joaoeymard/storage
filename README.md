# Armazenamento no client

Essa biblioteca facilita o uso do localStorage e do sessionStorage, ao tratar o que está armazenamento como um array em memória. Além de facilitar a adição, substituíção, atualização e remoção dos items salvos.

## Instalação

```html
<script src="storage.min.js"></script>
```

## Inicio

Crie uma instância do Storage em seu projeto. Lembre-se de informar no atributo 'storage' em qual storage deseja armazenar e no atributo 'key' qual chave vai armazenar suas informações.

Se o storage não for informado o padrão é o localStorage

```js
const st = new Storage({
  storage: localStorage, // Padrão
  key: "a", // Chave de identificação
});
```
