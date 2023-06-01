import fs from "node:fs";

export async function file(req, res) {
  const buffers = [];

  for await (const chunk of req) {
    buffers.push(chunk);
  }

  const fileData = Buffer.concat(buffers).toString();

  // Dividir o conteúdo do arquivo em linhas
  const lines = fileData.split("\n");

  // Array para armazenar os dados do CSV
  const data = [];

  let isDataSection = false;

  // Loop pelas linhas do CSV
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Ignorar linhas vazias
    if (line === "" || line.length < 2) {
      continue;
    }

    // Verificar se a linha marca o início da seção de dados
    if (line.includes("title;description")) {
      isDataSection = true;
      continue;
    }

    // Verificar se a linha marca o final da seção de dados
    if (line.includes("--X-INSOMNIA-BOUNDARY--")) {
      isDataSection = false;
      break; // Não é necessário processar mais linhas após o final da seção de dados
    }

    // Processar apenas as linhas de dados reais
    if (isDataSection) {
      const columns = line.split(";");
      columns[0] = "title:" + columns[0];
      columns[1] = "description:" + columns[1];
      data.push(columns);
    }
  }

  // Aqui você pode realizar o processamento dos dados do arquivo CSV

  let formatData = data.map((taskArray) => {
    return taskArray.reduce((result, column) => {
      const [key, value] = column.split(":");
      result[key] = value;
      return result;
    }, {});
  });

  try {
    req.body = {
      tasks: formatData,
    };
  } catch (e) {
    console.log(e);
    req.body = null;
  }

  res.setHeader("Content-type", "application/json");
}
