/* eslint-disable react-hooks/rules-of-hooks */
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import s from './index.module.scss'
//MOBX
import { cardsApi } from '@/shared/store/cards-api'
//ICONS
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
//HOOKS
import { useFormatInput } from '@/shared/hooks/useFormatInput'

export const SearchInputUI = observer(() => {
  const { t } = useTranslation()

  const { fetchMarkets } = cardsApi

  const [inputVal, setInputVal] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement | HTMLButtonElement>) => {
    e.preventDefault()
    const query = useFormatInput(inputVal)
    if (query.length < 1) return alert('Введите запрос')
    fetchMarkets(query)
  }

  return (
    <form onSubmit={handleSubmit} className={`${s.formInput} df aic`}>
      <motion.input
        type="text"
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        placeholder={t('header.input.placeholder')}
        className={s.input}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ease: 'easeOut', duration: 1 }}
      />
      <motion.button
        className={`${s.input_search} df jcc aic`}
        onClick={handleSubmit}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ease: 'easeOut', duration: 1 }}
      >
        <SearchOutlinedIcon />
      </motion.button>
    </form>
  )
})
