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

## Funções uteis

```js
st.count(); // Lista a quantidade de registros salvos

st.clear(); // Limpa o armazenamento

st.setExpire(1000 * 3); // Atualiza o tempo para expirar os dados armazenados, em milisegundos
```

## Exemplos

Armazene um novo registro

```js
st.insert({ id: 1, nome: "", idade: 1 });
// { id: 1, nome: "", idade: 1 }
```

Atualize um registro

```js
st.findOneAndUpdate(
  function (item, idx) {
    return item.id === 1;
  },
  { nome: "Fulano" }
);
// { id: 1, nome: "Fulano", idade: 1 }

st.findOneAndUpdate(
  function (item, idx) {
    return item.id === 1;
  },
  { idade: 10 }
);
// { id: 1, nome: "Fulano", idade: 10 }
```

Substitua um registro

```js
st.findOneAndReplace(
  function (item, idx) {
    return item.id === 1;
  },
  { id: 1, marca: "VW", modelo: "gol" }
);
// { id: 1, marca: "VW", modelo: "gol" }
```

Remova um registro

```js
// Localiza um registro e o exclui
st.findOneAndRemove(function (item, idx) {
  return item.id === 1;
});

// Remove o registro pela sua posição na lista
st.removeByIndex(0);
```

Listando todos os registros

```js
st.getDataParsed(); // Retorna o objeto armazenado já convertido em json

st.getDataArray(); // Retorna os dados armazenados obrigatoriamente como array
```

Buscando um registro

```js
st.find(function (item, idx) {
  return item.id === 1;
});
```
