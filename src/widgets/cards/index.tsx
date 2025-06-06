import s from './index.module.scss'
import { observer } from 'mobx-react-lite'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
//INTERFACES
import { ICard } from '@/shared/interfaces/ICard'
//COMPONENTS
import { CardListEntity } from '@/entities/cards'
import { CircularProgress } from '@mui/material'
//MOBX
import { cardsApi } from '@/shared/store/cards-api'
//ICONS
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'

export const CardsWidget = observer(() => {
  const { t } = useTranslation()
  const {
    cards: { cards },
  } = cardsApi

  if (!cards)
    return (
      <motion.div
        className="df fdc jcc aic m10 fz14"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ease: 'easeOut', duration: 1 }}
      >
        <SearchIcon style={{ fontSize: '65px' }} />
        <b>{t('main.preview')}</b>
      </motion.div>
    )

  if (cards?.state == 'pending') return <CircularProgress color="inherit" className="m10" />

  if (cards?.state == 'rejected')
    return (
      <div className="df fdc jcc aic m10 fz14">
        <CloseIcon style={{ fontSize: '65px' }} />
        <b>{t('main.error')}</b>
      </div>
    )

  return (
    <>
      <div className={`${s.markets_grid} dg jcc aic`}>
        {Object.entries(cards.value?.products_data)?.map(([key, cardList]) => (
          <CardListEntity cards={cardList as ICard[]} name={key} key={key} />
        ))}
      </div>
      {Object.entries(cards.value?.products_data).length == 0 && <h3>Not found :(</h3>}
    </>
  )
})
