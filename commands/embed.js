import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("embed")
  .setDescription("Envia uma mensagem embed personalizada")
  .addStringOption(option =>
    option.setName("titulo")
      .setDescription("Título do embed")
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName("descricao")
      .setDescription("Descrição do embed")
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName("cor")
      .setDescription("Cor hexadecimal do embed (ex: #00AE86)")
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName("thumbnail")
      .setDescription("URL da imagem de thumbnail (miniatura)")
      .setRequired(false)
  )
  .addStringOption(option =>
    option.setName("image")
      .setDescription("URL da imagem principal da embed")
      .setRequired(false)
  )
  .addBooleanOption(option =>
    option.setName("timestamp")
      .setDescription("Adicionar data/hora de envio à embed?")
      .setRequired(false)
  )
  .addAttachmentOption(option =>
    option.setName("thumbnail_file")
      .setDescription("Arquivo de imagem para miniatura (thumbnail)")
      .setRequired(false)
  )
  .addAttachmentOption(option =>
    option.setName("image_file")
      .setDescription("Arquivo de imagem principal da embed")
      .setRequired(false)
  );

export async function execute(interaction) {
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