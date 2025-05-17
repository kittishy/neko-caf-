import { createCommand } from "#base";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

createCommand({
  name: "embed",
  description: "Envia uma mensagem embed personalizada",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "titulo",
      description: "Título do embed",
      type: 3, // STRING
      required: false
    },
    {
      name: "descricao",
      description: "Descrição do embed",
      type: 3, // STRING
      required: false
    },
    {
      name: "cor",
      description: "Cor hexadecimal do embed (ex: #00AE86)",
      type: 3, // STRING
      required: false
    },
    {
      name: "thumbnail",
      description: "URL da imagem de thumbnail (miniatura)",
      type: 3, // STRING
      required: false
    },
    {
      name: "image",
      description: "URL da imagem principal da embed",
      type: 3, // STRING
      required: false
    },
    {
      name: "timestamp",
      description: "Adicionar data/hora de envio à embed?",
      type: 5, // BOOLEAN
      required: false
    },
    {
      name: "thumbnail_file",
      description: "Arquivo de imagem para miniatura (thumbnail)",
      type: 11, // ATTACHMENT
      required: false
    },
    {
      name: "image_file",
      description: "Arquivo de imagem principal da embed",
      type: 11, // ATTACHMENT
      required: false
    },
    {
      name: "url",
      description: "URL do título do embed",
      type: 3, // STRING
      required: false
    },
    {
      name: "author",
      description: "Nome do autor do embed",
      type: 3, // STRING
      required: false
    },
    {
      name: "author_icon",
      description: "URL do ícone do autor",
      type: 3, // STRING
      required: false
    },
    {
      name: "footer",
      description: "Texto do rodapé (footer)",
      type: 3, // STRING
      required: false
    },
    {
      name: "footer_icon",
      description: "URL do ícone do rodapé",
      type: 3, // STRING
      required: false
    },
    {
      name: "field1_name",
      description: "Nome do campo 1",
      type: 3,
      required: false
    },
    {
      name: "field1_value",
      description: "Valor do campo 1",
      type: 3,
      required: false
    },
    {
      name: "field1_inline",
      description: "Campo 1 em linha?",
      type: 5,
      required: false
    },
    {
      name: "fields_json",
      description: "JSON de campos para o embed (ex: [{\"name\":\"Campo\",\"value\":\"Valor\",\"inline\":true}])",
      type: 3, // STRING
      required: false
    }
  ],
  async run(interaction) {
    try {
      const titulo = interaction.options.getString("titulo") || "Titulo da embed";
      const descricao = interaction.options.getString("descricao") || "Descrição da embed";
      let cor = interaction.options.getString("cor") || "#00AE86";
      const thumbnail = interaction.options.getString("thumbnail");
      const image = interaction.options.getString("image");
      const thumbnailFile = interaction.options.getAttachment("thumbnail_file");
      const imageFile = interaction.options.getAttachment("image_file");
      const timestamp = interaction.options.getBoolean("timestamp");
      const url = interaction.options.getString("url");
      const author = interaction.options.getString("author");
      const authorIcon = interaction.options.getString("author_icon");
      const footer = interaction.options.getString("footer");
      const footerIcon = interaction.options.getString("footer_icon");
      const field1Name = interaction.options.getString("field1_name");
      const field1Value = interaction.options.getString("field1_value");
      const field1Inline = interaction.options.getBoolean("field1_inline");
      const fieldsJson = interaction.options.getString("fields_json");

      // Validação simples da cor
      if (!/^#?[0-9A-Fa-f]{6}$/.test(cor)) {
        await interaction.reply({ content: "Cor inválida. Use um valor hexadecimal como #00AE86.", ephemeral: true });
        return;
      }
      
      if (!cor.startsWith("#")) cor = "#" + cor;

      const embed = new EmbedBuilder()
        .setTitle(titulo)
        .setDescription(descricao)
        .setColor(cor);

      if (url && /^https?:\/\/\S+$/.test(url)) {
        embed.setURL(url);
      }

      if (author) {
        embed.setAuthor({
          name: author,
          iconURL: authorIcon && /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(authorIcon) ? authorIcon : undefined
        });
      }

      if (footer) {
        embed.setFooter({
          text: footer,
          iconURL: footerIcon && /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(footerIcon) ? footerIcon : undefined
        });
      }

      if (field1Name && field1Value) {
        embed.addFields({
          name: field1Name,
          value: field1Value,
          inline: field1Inline ?? false
        });
      }

      // Adiciona campos via JSON, se fornecido
      if (fieldsJson) {
        try {
          const fields = JSON.parse(fieldsJson);
          if (Array.isArray(fields)) {
            for (const field of fields) {
              if (
                typeof field.name === "string" &&
                typeof field.value === "string"
              ) {
                embed.addFields({
                  name: field.name,
                  value: field.value,
                  inline: !!field.inline
                });
              }
            }
          } else {
            await interaction.reply({ content: "O JSON de campos deve ser um array de objetos.", ephemeral: true });
            return;
          }
        } catch (e) {
          await interaction.reply({ content: "JSON de campos inválido.", ephemeral: true });
          return;
        }
      }

      if (thumbnailFile) {
        if (thumbnailFile.contentType && thumbnailFile.contentType.startsWith("image/")) {
          embed.setThumbnail(thumbnailFile.url);
        } else {
          await interaction.reply({ content: "Arquivo de miniatura inválido. Envie uma imagem.", ephemeral: true });
          return;
        }
      } else if (thumbnail) {
        if (/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(thumbnail)) {
          embed.setThumbnail(thumbnail);
        } else {
          await interaction.reply({ content: "URL de thumbnail inválida. Use um link direto para uma imagem.", ephemeral: true });
          return;
        }
      }

      if (imageFile) {
        if (imageFile.contentType && imageFile.contentType.startsWith("image/")) {
          embed.setImage(imageFile.url);
        } else {
          await interaction.reply({ content: "Arquivo de imagem inválido. Envie uma imagem.", ephemeral: true });
          return;
        }
      } else if (image) {
        if (/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(image)) {
          embed.setImage(image);
        } else {
          await interaction.reply({ content: "URL de imagem inválida. Use um link direto para uma imagem.", ephemeral: true });
          return;
        }
      }

      if (timestamp) {
        embed.setTimestamp(new Date());
      }

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error("Erro ao processar o comando /embed:", err);
      if (!interaction.replied) {
        await interaction.reply({ content: "Ocorreu um erro ao processar o comando.", ephemeral: true });
      }
    }
  }
});