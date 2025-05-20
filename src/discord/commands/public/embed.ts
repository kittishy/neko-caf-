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