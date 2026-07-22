$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$iconDir = Join-Path $root "assets\icons"
$backupDir = Join-Path $root "assets\icons-original"

New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$targetColor = [System.Drawing.Color]::FromArgb(255, 0, 128, 115)

function Get-IsTealPixel {
  param([System.Drawing.Color]$Color)

  $max = [Math]::Max($Color.R, [Math]::Max($Color.G, $Color.B))
  $min = [Math]::Min($Color.R, [Math]::Min($Color.G, $Color.B))
  $saturation = $max - $min

  $greenBlueDominant = ($Color.G -ge ($Color.R + 18)) -and ($Color.B -ge ($Color.R + 8))
  $darkEnough = $max -lt 245

  return $darkEnough -and $greenBlueDominant -and ($saturation -ge 12)
}

foreach ($file in Get-ChildItem -Path $iconDir -Filter "*.png") {
  $backupPath = Join-Path $backupDir $file.Name
  if (-not (Test-Path $backupPath)) {
    Copy-Item -LiteralPath $file.FullName -Destination $backupPath
  }

  $source = [System.Drawing.Bitmap]::FromFile($file.FullName)

  try {
    $scale = 3
    $clean = New-Object System.Drawing.Bitmap ($source.Width * $scale), ($source.Height * $scale), ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($clean)

    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
    }
    finally {
      $graphics.Dispose()
    }

    for ($y = 0; $y -lt $source.Height; $y++) {
      for ($x = 0; $x -lt $source.Width; $x++) {
        $pixel = $source.GetPixel($x, $y)

        if (Get-IsTealPixel $pixel) {
          $intensity = 255 - [Math]::Min(210, [Math]::Max(0, ($pixel.R * 0.25 + $pixel.G * 0.35 + $pixel.B * 0.4)))
          $alpha = [int][Math]::Max(155, [Math]::Min(255, $intensity + 70))
          $cleanPixel = [System.Drawing.Color]::FromArgb($alpha, $targetColor.R, $targetColor.G, $targetColor.B)

          for ($dy = 0; $dy -lt $scale; $dy++) {
            for ($dx = 0; $dx -lt $scale; $dx++) {
              $clean.SetPixel(($x * $scale) + $dx, ($y * $scale) + $dy, $cleanPixel)
            }
          }
        }
      }
    }

    $tmpPath = "$($file.FullName).tmp"
    $clean.Save($tmpPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $clean.Dispose()
  }
  finally {
    $source.Dispose()
  }

  Move-Item -LiteralPath $tmpPath -Destination $file.FullName -Force
}
