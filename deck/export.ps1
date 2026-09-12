$ErrorActionPreference = 'Stop'
$src = 'E:\zcode-data\workspace\nic3\porichoy\deck\Porichoy_NIC3_Deck.pptx'
$outDir = 'E:\zcode-data\workspace\nic3\porichoy\deck'
$pdf = 'E:\zcode-data\workspace\nic3\porichoy\deck\Porichoy_NIC3_Deck.pdf'
$pp = New-Object -ComObject PowerPoint.Application
$pres = $pp.Presentations.Open($src, $true, $false, $false)
$pres.SaveAs($pdf, 32)
$slideNo = 1
foreach ($slide in $pres.Slides) {
  $slide.Export("$outDir\slide$slideNo.png", 'PNG', 1600, 900)
  $slideNo++
}
$pres.Close()
$pp.Quit()
Write-Output "exported $($slideNo - 1) slides + pdf"
