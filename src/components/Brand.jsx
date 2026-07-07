import { Link } from 'react-router-dom'

export default function Brand({ compact = false }) {
  return <Link to="/" className="flex items-center gap-3" aria-label="Corn Bite home">
    <img src={compact?'/images/corn-bite-mark.png':'/images/corn-bite-logo.png'} alt="" className={compact?'h-11 w-11 rounded-full object-cover':'h-12 w-auto max-w-[165px] object-contain sm:h-14 sm:max-w-[190px]'}/>
  </Link>
}
