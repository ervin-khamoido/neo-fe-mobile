import React, { useCallback } from 'react'
import { observer } from 'mobx-react-lite'

import ioc from '../../../../ioc'

import { ActivePaymentBLoC } from './active-payment.bloc'
import { Alert } from '../../../../component/alert'

export const ActivePaymentWidget = observer(props => {
  const bloc = ioc.useBLoC(ActivePaymentBLoC, props)

  const onPOContinue = useCallback(() => bloc.onPOContinue(), [bloc])
  const onSOContinue = useCallback(() => bloc.onSOContinue(), [bloc])

  const showActivePayment = !!bloc.poActivity || !!bloc.soActivity

  return (
    showActivePayment && (
      <>
        {bloc.poActivity && (
          <Alert
            text={'Payment not Confirmed'}
            amount={`${bloc.srcCurrencySymbol + bloc.displayPOTotal}`}
            showNextBtn
            onClickNextBtn={onPOContinue}
            nextBtnDisabled={bloc.loading}
          />
        )}
        {bloc.soActivity && (
          <Alert
            text={'Did you Receive?'}
            amount={`${bloc.srcCurrencySymbol + bloc.displaySOTotal}`}
            showNextBtn
            onClickNextBtn={onSOContinue}
            nextBtnDisabled={bloc.loading}
          />
        )}
      </>
    )
  )
})
