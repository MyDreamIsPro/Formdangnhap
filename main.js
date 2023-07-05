// đối tượng

function Validator(options) {
    // tìm cha của element giống selector
    function getParent( element, seclector) {
        while (element.parentElement){
            if (element.parentElement.matches(seclector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    var seclectorRule = {}

    // Hàm thực hiện Validate
    function validate(inputElement, rule){

        var errorMessage;
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)

        //Lấy ra các rule của selector
        var rules = seclectorRule[rule.seclector]
        // lặp qua các rule để kiểm tra
        for ( var i=0; i<rules.length; i++){
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                         formElement.querySelector(rule.selector + ':checked')
                     )
                     break;
             default:
                errorMessage = rules[i](inputElement.value) 
            }

            // nếu có lỗi thì dừng kiểm tra
            if (errorMessage) {
                break
            }
        }
        if (errorMessage) {
            errorElement.innerHTML = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        }
        else{
            errorElement.innerHTML = '';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')

        }
        return !errorMessage;
    }

    // lấy element của form cần validate
    var formElement = document.querySelector(options.form)
    if (formElement) {
       // Khi submit form 
        formElement.onsubmit = function (e) {
            e.preventDefault()


            var isFormValaid = true;
            // lặp qua mỗi rule và xử lý
            options.rules.forEach( function(rule){
                var inputElement= formElement.querySelector(rule.seclector)
                var isValaid= validate(inputElement, rule)
               
                if(!isValaid){
                    isFormValaid = false
                }
            })
            
            if(isFormValaid){
                // Trường hợp submit với javascript
                if(typeof options.onSubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    var formValues = Array.from(enableInputs).reduce(function(values, input){
                        switch (input.type){
                            case 'radio':
                            case 'checkbox':
                                    values[input.name]= formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                
                                break;
                            default:
                                values[input.name]= input.value

                        }
                        return values;
                    }, {})
                    options.onSubmit(formValues)
                }
                // trường hợp submit với hành vi bình thường
                else {
                    formElement.submit();
                }
            }
        }
        //lặp qua mỗi rule và xử lý
        options.rules.forEach( function(rule){

            //Lưu lại các rule cho các input
            if(Array.isArray(seclectorRule[rule.seclector])) {
                seclectorRule[rule.seclector].push(rule.test)
            }
            else{
                seclectorRule[rule.seclector] = [rule.test]
            }


            var inputElements = formElement.querySelectorAll(rule.seclector)
            Array.from(inputElements).forEach(function(inputElement){
                // xử lý trường hợp blur khỏi in-put
                 inputElement.onblur = function(){
                  validate(inputElement, rule)
                 }
                 // xử lý mỗi khi người dùng nhập in-put
                 inputElement.oninput = function(){
                     var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                  
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                 }

            })    
        });
    }
}

// định nghĩa rule

Validator.isRequired = function (seclector, message) {
    return {
        seclector: seclector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
};

Validator.isEmail= function (seclector, message) {
    return {
        seclector: seclector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Trường này phải là Email'
        }
    }
};

Validator.minLength= function (seclector, min, message) {
    return {
        seclector: seclector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`
        }
    }
};

Validator.isConfirmed= function (seclector, getConfirmValue, message) {
    return {
        seclector: seclector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || `Giá trị mật khẩu nhập không chính xác`
        }
    }
};


