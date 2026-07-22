$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$sourcePath = "C:\Users\user\Downloads\ChatGPT Image Jul 10, 2026, 04_41_07 PM.png"
$outDir = Join-Path $root "assets\icons"
$backupDir = Join-Path $root "assets\icons-before-ai-grid"

New-Item -ItemType Directory -Force -Path $outDir | Out-Null
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$gridNames = @(
  @("healthcare", "climate", "open-green-spaces", "agriculture-food", "natural-assets"),
  @("real-estate", "settlement", "land-use", "citizen-engagement", "government-finance"),
  @("legislation-policy", "transportation", "water", "energy", "ict"),
  @("waste", "culture", "education", "safety", "population"),
  @("employment", "hajj-umrah", "tourism", "economy", "social-development")
)

function Test-TealPixel {
  param([System.Drawing.Color]$Color)

  $max = [Math]::Max($Color.R, [Math]::Max($Color.G, $Color.B))
  $min = [Math]::Min($Color.R, [Math]::Min($Color.G, $Color.B))

  return ($Color.G -gt ($Color.R + 18)) -and
    ($Color.B -gt ($Color.R + 8)) -and
    (($max - $min) -gt 18) -and
    ($max -lt 245)
}

foreach ($file in Get-ChildItem -Path $outDir -Filter "*.png") {
  $backupPath = Join-Path $backupDir $file.Name
  if (-not (Test-Path $backupPath)) {
    Copy-Item -LiteralPath $file.FullName -Destination $backupPath
  }
}

$source = [System.Drawing.Bitmap]::FromFile($sourcePath)

try {
  $cellWidth = $source.Width / 5
  $cellHeight = $source.Height / 5
  $targetColor = [System.Drawing.Color]::FromArgb(255, 0, 128, 115)

  for ($row = 0; $row -lt 5; $row++) {
    for ($col = 0; $col -lt 5; $col++) {
      $name = $gridNames[$row][$col]
      $left = [int][Math]::Round($col * $cellWidth)
      $top = [int][Math]::Round($row * $cellHeight)
      $right = [int][Math]::Round(($col + 1) * $cellWidth)
      $bottom = [int][Math]::Round(($row + 1) * $cellHeight)
      $width = $right - $left
      $height = $bottom - $top

      $clean = New-Object System.Drawing.Bitmap $width, $height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      $minX = $width
      $minY = $height
      $maxX = 0
      $maxY = 0

      for ($y = 0; $y -lt $height; $y++) {
        for ($x = 0; $x -lt $width; $x++) {
          $pixel = $source.GetPixel($left + $x, $top + $y)

          if (Test-TealPixel $pixel) {
            $alpha = [int][Math]::Min(255, [Math]::Max(170, 255 - ($pixel.R * 0.4)))
            $clean.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $targetColor.R, $targetColor.G, $targetColor.B))
            $minX = [Math]::Min($minX, $x)
            $minY = [Math]::Min($minY, $y)
            $maxX = [Math]::Max($maxX, $x)
            $maxY = [Math]::Max($maxY, $y)
          }
        }
      }

      if ($maxX -le $minX -or $maxY -le $minY) {
        $clean.Dispose()
        continue
      }

      $padding = 10
      $cropX = [Math]::Max(0, $minX - $padding)
      $cropY = [Math]::Max(0, $minY - $padding)
      $cropRight = [Math]::Min($width - 1, $maxX + $padding)
      $cropBottom = [Math]::Min($height - 1, $maxY + $padding)
      $cropWidth = $cropRight - $cropX + 1
      $cropHeight = $cropBottom - $cropY + 1

      $trimmed = New-Object System.Drawing.Bitmap $cropWidth, $cropHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      $graphics = [System.Drawing.Graphics]::FromImage($trimmed)

      try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.DrawImage($clean, 0, 0, (New-Object System.Drawing.Rectangle $cropX, $cropY, $cropWidth, $cropHeight), [System.Drawing.GraphicsUnit]::Pixel)
        $output = Join-Path $outDir "$name.png"
        $trimmed.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
      }
      finally {
        $graphics.Dispose()
        $trimmed.Dispose()
        $clean.Dispose()
      }
    }
  }
}
finally {
  $source.Dispose()
}
