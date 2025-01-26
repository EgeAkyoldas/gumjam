interface GameInstructionsProps {
  isVisible: boolean
}

export const GameInstructions = ({ isVisible }: GameInstructionsProps) => {
  if (!isVisible) return null

  return (
    <div className="p-4 bg-blue-100 text-blue-800 rounded-lg">
      <h3 className="font-bold mb-2">Nasıl Oynanır:</h3>
      <ul className="list-disc list-inside space-y-1 text-sm">
        <li>Sakız mükemmel bölgedeyken SPACE tuşuna basarak çiğneyin</li>
        <li>Doğru zamanlama ile daha yüksek puan kazanın</li>
        <li>Combo yaparak puanınızı katlayın</li>
        <li>Kaçırmamaya dikkat edin, can kaybedersiniz!</li>
        <li>3 ardışık başarılı çiğneme ile SQUEEZE modunu aktifleştirin</li>
      </ul>

      <div className="mt-4 text-sm">
        <h4 className="font-bold mb-1">Bölgeler:</h4>
        <ul className="space-y-1">
          <li className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
            <span>Mükemmel - En yüksek puan ve hasar</span>
          </li>
          <li className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
            <span>İyi - Orta seviye puan ve hasar</span>
          </li>
          <li className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-500 mr-2" />
            <span>Erken - Puan yok, combo bozulur</span>
          </li>
          <li className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
            <span>Geç - Can kaybı ve combo sıfırlanır</span>
          </li>
        </ul>
      </div>
    </div>
  )
} 