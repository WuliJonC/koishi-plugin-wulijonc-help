import { Context, Schema, h } from 'koishi'
import { readFile } from 'fs/promises'
import { resolve, extname } from 'path'

export const name = 'wulijonc-help'

// =============================================
// 类型定义
// =============================================

interface CommandEntry {
  command: string
  description: string
  imagePath?: string   // 本地图片路径
  imageUrl?: string    // 云端图片 URL
  message: string
}

export interface Config {
  commands: CommandEntry[]
}

// =============================================
// Schema（控制台 GUI）
// =============================================
//
// 图片来源支持两种方式（二选一）：
//   imagePath — 本地文件路径（通过文件选择器选取）
//   imageUrl  — 云端 URL（如 https://example.com/help.png）
//
// 如果同时填了两个，优先使用 imageUrl（因为零内存开销）。

export const Config: Schema<Config> = Schema.object({
  commands: Schema.array(Schema.object({
    command: Schema.string()
      .required()
      .description('命令名称（用户在聊天中输入的触发词）'),
    description: Schema.string()
      .default('自定义回复')
      .description('命令描述（显示在 help 列表中）'),
    imageUrl: Schema.string()
      .description('图片 URL（推荐，零内存开销。与下方"本地路径"二选一）'),
    imagePath: Schema.path({
      filters: [{
        name: '图片文件',
        extensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'],
      }],
    }).description('本地图片路径（大图会在每次发送时临时读取，不常驻内存）'),
    message: Schema.string()
      .default('')
      .description('附带的文字消息（可留空）'),
  })).default([]).description('命令列表 —— 每条命令可发送不同的图片和/或文字'),
})

// =============================================
// 工具函数
// =============================================

function getMimeType(filePath: string): string {
  const ext = extname(filePath).toLowerCase()
  const mimeMap: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.bmp': 'image/bmp',
    '.svg': 'image/svg+xml',
  }
  return mimeMap[ext] || 'image/png'
}

// =============================================
// 插件入口
// =============================================
//
// 内存策略：
//   - 云端 URL：直接传给 h.image(url)，平台自行下载，本地零内存
//   - 本地文件：每次命令触发时 异步读取 → 转 base64 → 发送 → GC 回收
//     不做持久缓存。14MB 文件的峰值约 33MB，仅存在毫秒级，发完即释放。
//
// 为什么不缓存本地文件？
//   10 张 14MB 图片缓存 base64 ≈ 187MB 常驻内存，不可接受。
//   按需读取的代价仅是每次触发时一次磁盘 I/O（14MB 约 10~50ms），
//   对于「发帮助图」这类低频命令完全可以接受。

export function apply(ctx: Context, config: Config) {
  for (const entry of config.commands) {
    if (!entry.command) continue

    ctx.command(entry.command, entry.description)
      .action(async () => {
        let result = ''

        if (entry.message) {
          result += entry.message
        }

        // 优先使用云端 URL（零内存，最优方案）
        if (entry.imageUrl) {
          result += h.image(entry.imageUrl)
        }
        // 其次使用本地文件（按需读取，不缓存）
        else if (entry.imagePath) {
          const absolutePath = resolve(entry.imagePath)
          try {
            // 异步读取，不阻塞事件循环
            const buffer = await readFile(absolutePath)
            const mime = getMimeType(absolutePath)
            // buffer 和 base64 字符串在 return 后即无引用，GC 会回收
            result += h.image(`data:${mime};base64,${buffer.toString('base64')}`)
          } catch {
            return `无法读取图片文件：${absolutePath}`
          }
        }

        return result || '该命令未配置任何内容'
      })
  }
}
