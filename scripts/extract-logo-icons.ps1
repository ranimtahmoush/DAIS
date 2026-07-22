$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root "assets\icons"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$sources = @(
  @{
    Path = "C:\Users\user\OneDrive - Naseej for Technology\Pictures\Screenshots\Screenshot 2026-07-10 104050.png"
    Names = @("healthcare", "culture", "education", "safety", "population", "social-development")
  },
  @{
    Path = "C:\Users\user\OneDrive - Naseej for Technology\Pictures\Screenshots\Screenshot 2026-07-10 104057.png"
    Names = @("transportation", "water", "energy", "ict", "waste")
  },
  @{
    Path = "C:\Users\user\OneDrive - Naseej for Technology\Pictures\Screenshots\Screenshot 2026-07-10 104105.png"
    Names = @("economy", "employment", "hajj-umrah", "tourism")
  },
  @{
    Path = "C:\Users\user\OneDrive - Naseej for Technology\Pictures\Screenshots\Screenshot 2026-07-10 104114.png"
    Names = @("citizen-engagement", "government-finance", "legislation-policy")
  },
  @{
    Path = "C:\Users\user\OneDrive - Naseej for Technology\Pictures\Screenshots\Screenshot 2026-07-10 104122.png"
    Names = @("real-estate", "settlement", "land-use")
  },
  @{
    Path = "C:\Users\user\OneDrive - Naseej for Technology\Pictures\Screenshots\Screenshot 2026-07-10 104129.png"
    Names = @("climate", "open-green-spaces", "agriculture-food", "natural-assets")
  }
)

foreach ($source in $sources) {
  $image = [System.Drawing.Bitmap]::FromFile($source.Path)

  try {
    $count = $source.Names.Count
    $rowHeight = $image.Height / $count

    for ($i = 0; $i -lt $count; $i++) {
      $top = [int][Math]::Round($i * $rowHeight)
      $bottom = [int][Math]::Round(($i + 1) * $rowHeight)
      $height = $bottom - $top

      $crop = New-Object System.Drawing.Rectangle 0, $top, $image.Width, $height
      $icon = New-Object System.Drawing.Bitmap $crop.Width, $crop.Height
      $graphics = [System.Drawing.Graphics]::FromImage($icon)

      try {
        $graphics.DrawImage($image, 0, 0, $crop, [System.Drawing.GraphicsUnit]::Pixel)
        $output = Join-Path $outDir "$($source.Names[$i]).png"
        $icon.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
      }
      finally {
        $graphics.Dispose()
        $icon.Dispose()
      }
    }
  }
  finally {
    $image.Dispose()
  }
}
